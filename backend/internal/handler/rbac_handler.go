package handler

import (
	"fmt"
	"net/http"
	"strings"

	"pmb-staici-backend/internal/crypto"
	"pmb-staici-backend/internal/database"
	"pmb-staici-backend/internal/model"
	"pmb-staici-backend/internal/response"
	"pmb-staici-backend/internal/util"

	"github.com/gin-gonic/gin"
)

type RBACHandler struct{}

func NewRBACHandler() *RBACHandler {
	return &RBACHandler{}
}

func getRoleFromContext(c *gin.Context) string {
	if roleVal, exists := c.Get("role"); exists {
		switch v := roleVal.(type) {
		case model.Role:
			return string(v)
		case string:
			return v
		}
	}
	return ""
}

// GetNavMenus returns dynamic menu groups & allowed menus for the current user's role
func (h *RBACHandler) GetNavMenus(c *gin.Context) {
	roleStr := getRoleFromContext(c)
	if roleStr == "" {
		response.Unauthorized(c, "Role pengguna tidak terautentikasi")
		return
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
			// Super admin gets all active menus.
			// Non-super-admin can NEVER access 'rbac' menu, and only gets explicitly allowed menus
			if roleStr == string(model.RoleSuperAdmin) {
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
			} else {
				if m.Key == "rbac" {
					continue // Non-super-admin can NEVER receive rbac menu
				}
				if allowedMenuIDs[m.ID] {
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

// DeleteMenuGroup deletes a menu group and its associated menus
func (h *RBACHandler) DeleteMenuGroup(c *gin.Context) {
	id := c.Param("id")
	var group model.MenuGroup
	if err := database.DB.First(&group, id).Error; err != nil {
		response.NotFound(c, "Menu group tidak ditemukan")
		return
	}

	// Safety check: Prevent deleting group containing 'rbac' menu
	var rbacChild model.Menu
	if err := database.DB.Where("menu_group_id = ? AND `key` = ?", group.ID, "rbac").First(&rbacChild).Error; err == nil {
		response.BadRequest(c, "Menu group ini memuat modul 'rbac' inti sistem dan tidak boleh dihapus", "")
		return
	}

	// Find and remove all child menus and their role associations permanently
	var childMenus []model.Menu
	database.DB.Unscoped().Where("menu_group_id = ?", group.ID).Find(&childMenus)
	for _, m := range childMenus {
		database.DB.Unscoped().Where("menu_id = ?", m.ID).Delete(&model.RoleMenu{})
		database.DB.Unscoped().Delete(&m)
	}

	database.DB.Unscoped().Delete(&group)
	RecordAdminLog(c, "Hapus Menu Group", "Menghapus menu group: "+group.Nama)
	response.Success(c, http.StatusOK, "Menu group beserta menu di dalamnya berhasil dihapus", nil)
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

// UpdateMenu updates an existing menu item
func (h *RBACHandler) UpdateMenu(c *gin.Context) {
	id := c.Param("id")
	var menu model.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		response.NotFound(c, "Menu tidak ditemukan")
		return
	}

	var req struct {
		MenuGroupID uint   `json:"menu_group_id"`
		Nama        string `json:"nama"`
		Key         string `json:"key"`
		Icon        string `json:"icon"`
		URL         string `json:"url"`
		BadgeText   string `json:"badge_text"`
		Urutan      int    `json:"urutan"`
		IsAktif     *bool  `json:"is_aktif"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data menu tidak valid", err.Error())
		return
	}

	if req.MenuGroupID > 0 {
		menu.MenuGroupID = req.MenuGroupID
	}
	if req.Nama != "" {
		menu.Nama = req.Nama
	}
	// Prevent changing key if it's the core system 'rbac' menu
	if req.Key != "" && menu.Key != "rbac" {
		cleanKey := strings.ToLower(strings.TrimSpace(req.Key))
		menu.Key = cleanKey
		menu.URL = cleanKey
	}
	if req.Icon != "" {
		menu.Icon = req.Icon
	}
	if req.URL != "" && menu.Key != "rbac" {
		menu.URL = req.URL
	}
	menu.BadgeText = req.BadgeText
	if req.Urutan > 0 {
		menu.Urutan = req.Urutan
	}
	if req.IsAktif != nil {
		menu.IsAktif = *req.IsAktif
	}

	database.DB.Save(&menu)
	RecordAdminLog(c, "Update Menu", "Memperbarui menu: "+menu.Nama)
	response.Success(c, http.StatusOK, "Menu berhasil diperbarui", menu)
}

// DeleteMenu deletes a menu item
func (h *RBACHandler) DeleteMenu(c *gin.Context) {
	id := c.Param("id")
	var menu model.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		response.NotFound(c, "Menu tidak ditemukan")
		return
	}

	// Safety check: 'rbac' menu cannot be deleted
	if menu.Key == "rbac" || menu.URL == "rbac" {
		response.BadRequest(c, "Menu 'rbac' adalah menu sistem inti dan tidak boleh dihapus", "")
		return
	}

	// Hard delete role permissions for this menu and the menu itself
	database.DB.Unscoped().Where("menu_id = ?", menu.ID).Delete(&model.RoleMenu{})
	database.DB.Unscoped().Delete(&menu)

	RecordAdminLog(c, "Hapus Menu", "Menghapus menu permanen: "+menu.Nama)
	response.Success(c, http.StatusOK, "Menu berhasil dihapus permanen", nil)
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

	// Safety check: 'rbac' menu ID should NEVER be assigned to non-super_admin roles!
	var rbacMenu model.Menu
	if err := database.DB.Where("`key` = ?", "rbac").First(&rbacMenu).Error; err == nil {
		if req.RoleKode != string(model.RoleSuperAdmin) {
			var filteredIDs []uint
			for _, id := range req.MenuIDs {
				if id != rbacMenu.ID {
					filteredIDs = append(filteredIDs, id)
				}
			}
			req.MenuIDs = filteredIDs
		}
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

// ListAdminUsers returns all non-student admin users
func (h *RBACHandler) ListAdminUsers(c *gin.Context) {
	var users []model.User
	database.DB.Where("role != ?", model.RoleCalonMahasiswa).Order("id ASC").Find(&users)
	response.Success(c, http.StatusOK, "Daftar pengguna administrator", users)
}

// UpdateUserRole updates an admin's role
func (h *RBACHandler) UpdateUserRole(c *gin.Context) {
	id := c.Param("id")
	var user model.User
	if err := database.DB.First(&user, id).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	var req struct {
		Role model.Role `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Role tidak valid", err.Error())
		return
	}

	// Prevent demoting the last super admin
	if user.Role == model.RoleSuperAdmin && req.Role != model.RoleSuperAdmin {
		var saCount int64
		database.DB.Model(&model.User{}).Where("role = ?", model.RoleSuperAdmin).Count(&saCount)
		if saCount <= 1 {
			response.BadRequest(c, "Tidak dapat mengubah role Super Admin terakhir dalam sistem", "Sistem membutuhkan minimal 1 akun Super Admin")
			return
		}
	}

	oldRole := user.Role
	user.Role = req.Role
	database.DB.Save(&user)

	RecordAdminLog(c, "Ubah Role Admin", fmt.Sprintf("Admin %s (ID %d) diubah dari %s ke %s", user.NamaLengkap, user.ID, oldRole, user.Role))
	response.Success(c, http.StatusOK, "Role pengguna berhasil diperbarui", user)
}

// CreateAdminUser creates a new admin user
func (h *RBACHandler) CreateAdminUser(c *gin.Context) {
	var req struct {
		NamaLengkap string     `json:"nama_lengkap" binding:"required"`
		NIK         string     `json:"nik" binding:"required"`
		Email       string     `json:"email" binding:"required"`
		Password    string     `json:"password" binding:"required"`
		NoHP        string     `json:"no_hp"`
		Role        model.Role `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data pengguna tidak valid", err.Error())
		return
	}

	nikIdx := crypto.BlindIndex(req.NIK)
	var countNIK int64
	database.DB.Model(&model.User{}).Where("nik_idx = ? OR nik = ?", nikIdx, req.NIK).Count(&countNIK)
	if countNIK > 0 {
		response.BadRequest(c, "Username / NIK sudah terdaftar", "Gunakan NIK atau username lain")
		return
	}

	var countEmail int64
	database.DB.Model(&model.User{}).Where("email = ?", req.Email).Count(&countEmail)
	if countEmail > 0 {
		response.BadRequest(c, "Email sudah terdaftar", "Gunakan email lain")
		return
	}

	hash, err := util.HashPassword(req.Password)
	if err != nil {
		response.InternalServerError(c, "Gagal mengenkripsi kata sandi")
		return
	}

	newUser := model.User{
		NamaLengkap:     req.NamaLengkap,
		NIK:             req.NIK,
		Email:           req.Email,
		NoHP:            req.NoHP,
		PasswordHash:    hash,
		Role:            req.Role,
		IsEmailVerified: true,
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	RecordAdminLog(c, "Tambah Akun Admin", fmt.Sprintf("Membuat akun admin baru: %s (%s)", newUser.NamaLengkap, newUser.Role))
	response.Success(c, http.StatusCreated, "Akun administrator baru berhasil dibuat", newUser)
}
