package handler

import (
	"net/http"
	"strings"

	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"

	"github.com/gin-gonic/gin"
)

type RBACHandler struct{}

func NewRBACHandler() *RBACHandler {
	return &RBACHandler{}
}

// GetNavMenus returns dynamic menu groups & allowed menus for the current user's role
func (h *RBACHandler) GetNavMenus(c *gin.Context) {
	roleStr := c.GetString("role")
	if roleStr == "" {
		roleStr = string(model.RoleSuperAdmin)
	}

	// Fetch all active menu groups ordered by 'urutan'
	var groups []model.MenuGroup
	if err := database.DB.Where("is_aktif = ?", true).Order("urutan ASC").Find(&groups).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	// Fetch allowed Menu IDs for this role
	var allowedRoleMenus []model.RoleMenu
	database.DB.Where("role_kode = ? AND allow_view = ?", roleStr, true).Find(&allowedRoleMenus)

	allowedMenuIDs := make(map[uint]bool)
	for _, rm := range allowedRoleMenus {
		allowedMenuIDs[rm.MenuID] = true
	}

	// Construct Response Groups with allowed Menus
	type MenuResp struct {
		ID          uint   `json:"id"`
		MenuGroupID uint   `json:"menu_group_id"`
		Nama        string `json:"nama"`
		Key         string `json:"key"`
		Icon        string `json:"icon"`
		URL         string `json:"url"`
		BadgeText   string `json:"badge_text"`
		Urutan      int    `json:"urutan"`
	}

	type GroupResp struct {
		ID     uint       `json:"id"`
		Nama   string     `json:"nama"`
		Urutan int        `json:"urutan"`
		Menus  []MenuResp `json:"menus"`
	}

	var result []GroupResp

	for _, g := range groups {
		var menus []model.Menu
		database.DB.Where("menu_group_id = ? AND is_aktif = ?", g.ID, true).Order("urutan ASC").Find(&menus)

		var groupMenus []MenuResp
		for _, m := range menus {
			// Super admin gets all active menus, other roles get allowed menus
			if roleStr == string(model.RoleSuperAdmin) || allowedMenuIDs[m.ID] {
				groupMenus = append(groupMenus, MenuResp{
					ID:          m.ID,
					MenuGroupID: m.MenuGroupID,
					Nama:        m.Nama,
					Key:         m.Key,
					Icon:        m.Icon,
					URL:         m.URL,
					BadgeText:   m.BadgeText,
					Urutan:      m.Urutan,
				})
			}
		}

		if len(groupMenus) > 0 {
			result = append(result, GroupResp{
				ID:     g.ID,
				Nama:   g.Nama,
				Urutan: g.Urutan,
				Menus:  groupMenus,
			})
		}
	}

	response.Success(c, http.StatusOK, "Menu navigasi dinamis berhasil dimuat", result)
}

// ListRoles returns all registered roles
func (h *RBACHandler) ListRoles(c *gin.Context) {
	var roles []model.RoleModel
	database.DB.Order("id ASC").Find(&roles)
	response.Success(c, http.StatusOK, "Daftar role pengguna", roles)
}

// CreateRole creates a new custom role
func (h *RBACHandler) CreateRole(c *gin.Context) {
	var req struct {
		Kode      string `json:"kode" binding:"required"`
		Nama      string `json:"nama" binding:"required"`
		Deskripsi string `json:"deskripsi"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data role tidak valid", err.Error())
		return
	}

	kodeClean := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Kode), " ", "_"))

	var existing model.RoleModel
	if err := database.DB.Where("kode = ?", kodeClean).First(&existing).Error; err == nil {
		response.Error(c, http.StatusConflict, "CONFLICT", "Kode role sudah terdaftar", "")
		return
	}

	newRole := model.RoleModel{
		Kode:      kodeClean,
		Nama:      req.Nama,
		Deskripsi: req.Deskripsi,
		IsSystem:  false,
	}

	if err := database.DB.Create(&newRole).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Role", "Membuat role baru: "+newRole.Nama)
	response.Success(c, http.StatusCreated, "Role baru berhasil dibuat", newRole)
}

// UpdateRole updates role metadata
func (h *RBACHandler) UpdateRole(c *gin.Context) {
	id := c.Param("id")
	var role model.RoleModel
	if err := database.DB.First(&role, id).Error; err != nil {
		response.NotFound(c, "Role tidak ditemukan")
		return
	}

	var req struct {
		Nama      string `json:"nama"`
		Deskripsi string `json:"deskripsi"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data tidak valid", err.Error())
		return
	}

	if req.Nama != "" {
		role.Nama = req.Nama
	}
	role.Deskripsi = req.Deskripsi

	database.DB.Save(&role)
	RecordAdminLog(c, "Update Role", "Memperbarui role: "+role.Nama)
	response.Success(c, http.StatusOK, "Role berhasil diperbarui", role)
}

// ListMenuGroups returns all menu groups
func (h *RBACHandler) ListMenuGroups(c *gin.Context) {
	var groups []model.MenuGroup
	database.DB.Preload("Menus").Order("urutan ASC").Find(&groups)
	response.Success(c, http.StatusOK, "Daftar menu group", groups)
}

// CreateMenuGroup creates a new menu group
func (h *RBACHandler) CreateMenuGroup(c *gin.Context) {
	var req struct {
		Nama   string `json:"nama" binding:"required"`
		Urutan int    `json:"urutan"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data menu group tidak valid", err.Error())
		return
	}

	group := model.MenuGroup{
		Nama:    req.Nama,
		Urutan:  req.Urutan,
		IsAktif: true,
	}

	database.DB.Create(&group)
	RecordAdminLog(c, "Tambah Menu Group", "Membuat menu group baru: "+group.Nama)
	response.Success(c, http.StatusCreated, "Menu group berhasil dibuat", group)
}

// UpdateMenuGroup updates menu group
func (h *RBACHandler) UpdateMenuGroup(c *gin.Context) {
	id := c.Param("id")
	var group model.MenuGroup
	if err := database.DB.First(&group, id).Error; err != nil {
		response.NotFound(c, "Menu group tidak ditemukan")
		return
	}

	var req struct {
		Nama    string `json:"nama"`
		Urutan  int    `json:"urutan"`
		IsAktif *bool  `json:"is_aktif"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data tidak valid", err.Error())
		return
	}

	if req.Nama != "" {
		group.Nama = req.Nama
	}
	group.Urutan = req.Urutan
	if req.IsAktif != nil {
		group.IsAktif = *req.IsAktif
	}

	database.DB.Save(&group)
	RecordAdminLog(c, "Update Menu Group", "Memperbarui menu group: "+group.Nama)
	response.Success(c, http.StatusOK, "Menu group berhasil diperbarui", group)
}

// ListMenus returns all menus
func (h *RBACHandler) ListMenus(c *gin.Context) {
	var menus []model.Menu
	database.DB.Preload("MenuGroup").Order("menu_group_id ASC, urutan ASC").Find(&menus)
	response.Success(c, http.StatusOK, "Daftar menu", menus)
}

// CreateMenu creates a new menu item
func (h *RBACHandler) CreateMenu(c *gin.Context) {
	var req struct {
		MenuGroupID uint   `json:"menu_group_id" binding:"required"`
		Nama        string `json:"nama" binding:"required"`
		Key         string `json:"key" binding:"required"`
		Icon        string `json:"icon"`
		URL         string `json:"url"`
		BadgeText   string `json:"badge_text"`
		Urutan      int    `json:"urutan"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data menu tidak valid", err.Error())
		return
	}

	menu := model.Menu{
		MenuGroupID: req.MenuGroupID,
		Nama:        req.Nama,
		Key:         strings.ToLower(strings.TrimSpace(req.Key)),
		Icon:        req.Icon,
		URL:         req.URL,
		BadgeText:   req.BadgeText,
		Urutan:      req.Urutan,
		IsAktif:     true,
	}

	if err := database.DB.Create(&menu).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Menu", "Membuat menu baru: "+menu.Nama)
	response.Success(c, http.StatusCreated, "Menu berhasil dibuat", menu)
}

// GetRolePermissions returns allowed menu IDs for a role
func (h *RBACHandler) GetRolePermissions(c *gin.Context) {
	roleKode := c.Param("role_kode")
	var roleMenus []model.RoleMenu
	database.DB.Where("role_kode = ?", roleKode).Find(&roleMenus)

	allowedMenuIDs := []uint{}
	for _, rm := range roleMenus {
		if rm.AllowView {
			allowedMenuIDs = append(allowedMenuIDs, rm.MenuID)
		}
	}

	response.Success(c, http.StatusOK, "Hak akses menu role", gin.H{
		"role_kode":        roleKode,
		"allowed_menu_ids": allowedMenuIDs,
	})
}

// UpdateRolePermissions assigns allowed menu IDs to a role
func (h *RBACHandler) UpdateRolePermissions(c *gin.Context) {
	var req struct {
		RoleKode string `json:"role_kode" binding:"required"`
		MenuIDs  []uint `json:"menu_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data tidak valid", err.Error())
		return
	}

	// Remove old permissions
	database.DB.Where("role_kode = ?", req.RoleKode).Delete(&model.RoleMenu{})

	// Insert new permissions
	for _, menuID := range req.MenuIDs {
		database.DB.Create(&model.RoleMenu{
			RoleKode:  req.RoleKode,
			MenuID:    menuID,
			AllowView: true,
		})
	}

	RecordAdminLog(c, "Update Permisi RBAC", "Memperbarui hak akses menu untuk role: "+req.RoleKode)
	response.Success(c, http.StatusOK, "Hak akses menu role berhasil diperbarui", nil)
}
