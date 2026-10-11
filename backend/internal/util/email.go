package util

import (
	"crypto/rand"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net"
	"net/smtp"
	"pmb-staici-backend/internal/config"
	"strconv"
	"strings"
	"time"
)

// GenerateOTP generates a cryptographically secure 6-digit numeric OTP string
func GenerateOTP() string {
	var table = [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
	b := make([]byte, 6)
	n, err := io.ReadAtLeast(rand.Reader, b, 6)
	if n != 6 || err != nil {
		// Fallback timestamp-based RNG
		return fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	}
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}

// SendVerificationOTPEmail sends a beautifully branded OTP verification email
func SendVerificationOTPEmail(cfg *config.Config, toEmail, recipientName, otpCode string) error {
	// If SMTP is not configured, run in simulation mode for seamless local development
	if strings.TrimSpace(cfg.SMTPHost) == "" || strings.TrimSpace(cfg.SMTPUser) == "" {
		log.Printf("==================================================================")
		log.Printf("[EMAIL SIMULATION] SMTP not configured. Development mode active.")
		log.Printf("[EMAIL SIMULATION] To: %s (%s)", toEmail, recipientName)
		log.Printf("[EMAIL SIMULATION] KODE OTP VERIFIKASI PMB: >>> %s <<<", otpCode)
		log.Printf("[EMAIL SIMULATION] Berlaku selama 15 Menit.")
		log.Printf("==================================================================")
		return nil
	}

	subject := fmt.Sprintf("%s - Kode Verifikasi OTP Pendaftaran Akun PMB STAICI", otpCode)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode OTP Verifikasi Akun PMB</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" width="100%%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Accent Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d3830 0%%, #175246 100%%); padding: 36px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                STAI CENDEKIA INSANI SITUBONDO
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500;">
                Penerimaan Mahasiswa Baru (PMB) Online
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Assalamu'alaikum Wr. Wb., <br>
                Halo, <strong style="color: #0f172a;">%s</strong>
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Terima kasih telah melakukan pendaftaran akun di portal Penerimaan Mahasiswa Baru (PMB) STAI Cendekia Insani Situbondo. Gunakan kode One-Time Password (OTP) berikut untuk memverifikasi akun Anda:
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
                <span style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #047857; margin-bottom: 8px;">
                  Kode Verifikasi OTP Anda
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #064e3b; display: inline-block;">
                  %s
                </span>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #059669; font-weight: 500;">
                  ⏱️ Kode ini hanya berlaku selama <strong>15 Menit</strong>
                </p>
              </div>

              <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                ⚠️ <strong>PENTING:</strong> Jangan bagikan kode OTP ini kepada siapa pun, termasuk panitia PMB. Kami tidak pernah meminta kode OTP rahasia Anda.
              </p>

              <p style="margin: 0 0 0 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                Jika Anda tidak merasa melakukan pendaftaran akun di portal PMB STAICI, silakan abaikan email ini.
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Panitia PMB STAI Cendekia Insani Situbondo
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Jl. Raya Panji No. 12, Situbondo, Jawa Timur | WhatsApp: 0852-3343-2221
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, recipientName, otpCode)

	return sendHTMLEmail(cfg, toEmail, subject, htmlBody)
}

// SendPasswordResetEmail sends password reset link email with clickable verification button
func SendPasswordResetEmail(cfg *config.Config, toEmail, recipientName, resetLink string) error {
	// If SMTP is not configured, run in simulation mode for seamless local development
	if strings.TrimSpace(cfg.SMTPHost) == "" || strings.TrimSpace(cfg.SMTPUser) == "" {
		log.Printf("==================================================================")
		log.Printf("[EMAIL SIMULATION] SMTP not configured. Development mode active.")
		log.Printf("[EMAIL SIMULATION] To: %s (%s)", toEmail, recipientName)
		log.Printf("[EMAIL SIMULATION] PERMINTAAN RESET KATA SANDI PMB")
		log.Printf("[EMAIL SIMULATION] KLIK LINK BERIKUT: >>> %s <<<", resetLink)
		log.Printf("[EMAIL SIMULATION] Berlaku selama 60 Menit.")
		log.Printf("==================================================================")
		return nil
	}

	subject := "Atur Ulang Kata Sandi Akun PMB STAI Cendekia Insani"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Kata Sandi Akun PMB</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Card -->
        <table role="presentation" width="100%%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Header Accent Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d3830 0%%, #175246 100%%); padding: 36px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                STAI CENDEKIA INSANI SITUBONDO
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500;">
                Penerimaan Mahasiswa Baru (PMB) Online
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Assalamu'alaikum Wr. Wb., <br>
                Halo, <strong style="color: #0f172a;">%s</strong>
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun PMB Anda. Silakan klik tombol verifikasi di bawah ini untuk membuat kata sandi baru:
              </p>

              <!-- Call To Action Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="%s" target="_blank" style="display: inline-block; background-color: #0d3830; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(13, 56, 48, 0.3); letter-spacing: 0.3px;">
                  🔒 Atur Ulang Kata Sandi Saya
                </a>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #475569;">
                  Atau salin tautan berikut ke peramban (browser) Anda:
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #0284c7; font-family: monospace;">
                  %s
                </p>
              </div>

              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #64748b;">
                ⏱️ Tautan verifikasi ini hanya berlaku selama <strong>60 Menit</strong> dan hanya dapat digunakan 1 kali.
              </p>

              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b;">
                Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini. Akun Anda tetap aman.
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Panitia PMB STAI Cendekia Insani Situbondo
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Jl. Raya Panji No. 12, Situbondo, Jawa Timur | WhatsApp: 0852-3343-2221
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, recipientName, resetLink, resetLink)

	return sendHTMLEmail(cfg, toEmail, subject, htmlBody)
}

// sendHTMLEmail is internal helper to deliver email via SMTP
func sendHTMLEmail(cfg *config.Config, toEmail, subject, htmlBody string) error {
	fromName := cfg.SMTPFromName
	if fromName == "" {
		fromName = "PMB STAI Cendekia Insani"
	}
	fromEmail := cfg.SMTPFrom
	if fromEmail == "" {
		fromEmail = cfg.SMTPUser
	}

	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", fromName, fromEmail)
	headers["To"] = toEmail
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	portInt, _ := strconv.Atoi(cfg.SMTPPort)
	if portInt == 0 {
		portInt = 587
	}
	addr := fmt.Sprintf("%s:%d", cfg.SMTPHost, portInt)

	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPHost)

	// Direct SSL on port 465
	if portInt == 465 {
		tlsConfig := &tls.Config{
			ServerName: cfg.SMTPHost,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("gagal terhubung ke SMTP TLS: %w", err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, cfg.SMTPHost)
		if err != nil {
			return fmt.Errorf("gagal membuat SMTP client: %w", err)
		}
		defer client.Quit()

		if err = client.Auth(auth); err != nil {
			return fmt.Errorf("autentikasi SMTP gagal: %w", err)
		}
		if err = client.Mail(fromEmail); err != nil {
			return fmt.Errorf("SMTP MAIL command gagal: %w", err)
		}
		if err = client.Rcpt(toEmail); err != nil {
			return fmt.Errorf("SMTP RCPT command gagal: %w", err)
		}
		w, err := client.Data()
		if err != nil {
			return fmt.Errorf("SMTP DATA command gagal: %w", err)
		}
		_, err = w.Write([]byte(message))
		if err != nil {
			return fmt.Errorf("gagal menulis email: %w", err)
		}
		err = w.Close()
		if err != nil {
			return fmt.Errorf("gagal menutup data email: %w", err)
		}
		return nil
	}

	// Standard STARTTLS (Port 587 or 25)
	host, _, _ := net.SplitHostPort(addr)
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("gagal terhubung ke server SMTP: %w", err)
	}
	defer client.Quit()

	if ok, _ := client.Extension("STARTTLS"); ok {
		config := &tls.Config{ServerName: host}
		if err = client.StartTLS(config); err != nil {
			return fmt.Errorf("gagal STARTTLS: %w", err)
		}
	}

	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("autentikasi SMTP gagal: %w", err)
	}
	if err = client.Mail(fromEmail); err != nil {
		return fmt.Errorf("SMTP MAIL error: %w", err)
	}
	if err = client.Rcpt(toEmail); err != nil {
		return fmt.Errorf("SMTP RCPT error: %w", err)
	}
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("SMTP DATA error: %w", err)
	}
	_, err = w.Write([]byte(message))
	if err != nil {
		return fmt.Errorf("gagal menulis data email: %w", err)
	}
	err = w.Close()
	if err != nil {
		return fmt.Errorf("gagal menyelesaikan pengiriman email: %w", err)
	}

	log.Printf("✓ Email berhasil dikirimkan ke %s", toEmail)
	return nil
}
