package ports

import (
	"context"
	"io"
)

// Storage เป็น port interface สำหรับ storage ทุกประเภท
// ไม่ว่าจะเป็น R2, S3, Bunny, Local, etc.
type Storage interface {
	// Upload อัปโหลดไฟล์ไปยัง storage
	// path: เส้นทางปลายทาง เช่น "thumbnails/abc123.jpg"
	// returns: public URL ของไฟล์
	Upload(ctx context.Context, path string, file io.Reader, contentType string) (string, error)

	// Delete ลบไฟล์จาก storage
	Delete(ctx context.Context, path string) error

	// GetURL สร้าง public URL จาก path
	GetURL(path string) string

	// Exists ตรวจสอบว่าไฟล์มีอยู่หรือไม่
	Exists(ctx context.Context, path string) (bool, error)
}

// StorageConfig เก็บ config ที่ใช้ร่วมกัน
type StorageConfig struct {
	PublicURL string
}

// SourceStorage interface สำหรับ read-only storage (ดึงไฟล์จาก source เช่น iDrive)
type SourceStorage interface {
	// GetFile ดึงไฟล์จาก storage
	GetFile(ctx context.Context, path string) (io.ReadCloser, error)

	// Exists ตรวจสอบว่าไฟล์มีอยู่หรือไม่
	Exists(ctx context.Context, path string) (bool, error)
}
