package handlers

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type CategoryHandler struct {
	categoryRepo repositories.CategoryRepository
}

func NewCategoryHandler(categoryRepo repositories.CategoryRepository) *CategoryHandler {
	return &CategoryHandler{
		categoryRepo: categoryRepo,
	}
}

// ListCategories godoc
// @Summary List all categories
// @Tags categories
// @Produce json
// @Param lang query string false "Language code (th, en)"
// @Success 200 {object} utils.Response
// @Router /api/v1/categories [get]
func (h *CategoryHandler) ListCategories(c *fiber.Ctx) error {
	ctx := c.UserContext()
	lang := c.Query("lang", "en") // default เป็นภาษาอังกฤษ

	categories, err := h.categoryRepo.List(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list categories", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	// Convert to response format
	result := make([]dto.CategoryResponse, 0, len(categories))
	for _, cat := range categories {
		// หาชื่อที่แปลแล้ว
		name := cat.Name // default เป็นชื่อหลัก
		for _, t := range cat.Translations {
			if t.Lang == lang {
				name = t.Name
				break
			}
		}

		result = append(result, dto.CategoryResponse{
			ID:         cat.ID,
			Name:       name,
			Slug:       cat.Slug,
			VideoCount: cat.VideoCount,
		})
	}

	return utils.SuccessResponse(c, result)
}


// GetCategory godoc
// @Summary Get category by ID
// @Tags categories
// @Produce json
// @Param id path string true "Category ID"
// @Param lang query string false "Language code (th, en)"
// @Success 200 {object} utils.Response
// @Router /api/v1/categories/{id} [get]
func (h *CategoryHandler) GetCategory(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid category ID")
	}

	lang := c.Query("lang", "en")

	category, err := h.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return utils.NotFoundResponse(c, "Category not found")
		}
		logger.ErrorContext(ctx, "Failed to get category", "category_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	// หาชื่อที่แปลแล้ว
	name := category.Name
	translations := make(map[string]string)
	for _, t := range category.Translations {
		translations[t.Lang] = t.Name
		if t.Lang == lang {
			name = t.Name
		}
	}

	return utils.SuccessResponse(c, dto.CategoryDetailResponse{
		ID:           category.ID,
		Name:         name,
		Slug:         category.Slug,
		VideoCount:   category.VideoCount,
		Translations: translations,
	})
}

// CreateCategory godoc
// @Summary Create a new category
// @Tags categories
// @Accept json
// @Produce json
// @Param category body dto.CreateCategoryRequest true "Category data"
// @Success 201 {object} utils.Response
// @Router /api/v1/categories [post]
func (h *CategoryHandler) CreateCategory(c *fiber.Ctx) error {
	ctx := c.UserContext()

	var req dto.CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	if err := utils.ValidateStruct(&req); err != nil {
		errs := utils.GetValidationErrors(err)
		logger.WarnContext(ctx, "Validation failed", "errors", errs)
		return utils.ValidationErrorResponse(c, errs)
	}

	// ตรวจสอบว่ามี category ชื่อนี้แล้วหรือไม่
	existing, _ := h.categoryRepo.GetByName(ctx, req.Name)
	if existing != nil {
		logger.WarnContext(ctx, "Category already exists", "name", req.Name)
		return utils.ConflictResponse(c, "Category already exists")
	}

	category := &models.Category{
		Name: req.Name,
		Slug: slug.Make(req.Name),
	}

	if err := h.categoryRepo.Create(ctx, category); err != nil {
		logger.ErrorContext(ctx, "Failed to create category", "name", req.Name, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	// สร้าง translations ถ้ามี
	if req.Translations != nil {
		for lang, name := range req.Translations {
			if name == "" {
				continue
			}
			trans := &models.CategoryTranslation{
				CategoryID: category.ID,
				Lang:       lang,
				Name:       name,
			}
			if err := h.categoryRepo.CreateTranslation(ctx, trans); err != nil {
				logger.WarnContext(ctx, "Failed to create category translation", "category_id", category.ID, "lang", lang, "error", err)
			}
		}
	}

	logger.InfoContext(ctx, "Category created", "category_id", category.ID, "name", category.Name)

	// ดึง category พร้อม translations
	category, _ = h.categoryRepo.GetByID(ctx, category.ID)
	translations := make(map[string]string)
	for _, t := range category.Translations {
		translations[t.Lang] = t.Name
	}

	return utils.CreatedResponse(c, dto.CategoryDetailResponse{
		ID:           category.ID,
		Name:         category.Name,
		Slug:         category.Slug,
		VideoCount:   category.VideoCount,
		Translations: translations,
	})
}

// UpdateCategory godoc
// @Summary Update category
// @Tags categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Param category body dto.UpdateCategoryRequest true "Category data"
// @Success 200 {object} utils.Response
// @Router /api/v1/categories/{id} [put]
func (h *CategoryHandler) UpdateCategory(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid category ID")
	}

	var req dto.UpdateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		logger.WarnContext(ctx, "Invalid request body", "error", err)
		return utils.BadRequestResponse(c, "Invalid request body")
	}

	category, err := h.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return utils.NotFoundResponse(c, "Category not found")
		}
		logger.ErrorContext(ctx, "Failed to get category for update", "category_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	// Update name ถ้ามีส่งมา
	if req.Name != nil && *req.Name != category.Name {
		// ตรวจสอบว่าชื่อใหม่ไม่ซ้ำกับ category อื่น
		existing, _ := h.categoryRepo.GetByName(ctx, *req.Name)
		if existing != nil && existing.ID != id {
			logger.WarnContext(ctx, "Category name already exists", "name", *req.Name)
			return utils.ConflictResponse(c, "Category name already exists")
		}
		category.Name = *req.Name
		category.Slug = slug.Make(*req.Name)
	}

	if err := h.categoryRepo.Update(ctx, category); err != nil {
		logger.ErrorContext(ctx, "Failed to update category", "category_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	// Update translations ถ้ามีส่งมา (ลบทั้งหมดแล้วสร้างใหม่)
	if req.Translations != nil {
		// ลบ translations เดิมทั้งหมด
		if err := h.categoryRepo.DeleteTranslationsByCategoryID(ctx, id); err != nil {
			logger.WarnContext(ctx, "Failed to delete category translations", "category_id", id, "error", err)
		}

		// สร้าง translations ใหม่
		for lang, name := range req.Translations {
			if name == "" {
				continue
			}
			trans := &models.CategoryTranslation{
				CategoryID: category.ID,
				Lang:       lang,
				Name:       name,
			}
			if err := h.categoryRepo.CreateTranslation(ctx, trans); err != nil {
				logger.WarnContext(ctx, "Failed to create category translation", "category_id", id, "lang", lang, "error", err)
			}
		}
	}

	logger.InfoContext(ctx, "Category updated", "category_id", id)

	// ดึง category พร้อม translations
	category, _ = h.categoryRepo.GetByID(ctx, id)
	translations := make(map[string]string)
	for _, t := range category.Translations {
		translations[t.Lang] = t.Name
	}

	return utils.SuccessResponse(c, dto.CategoryDetailResponse{
		ID:           category.ID,
		Name:         category.Name,
		Slug:         category.Slug,
		VideoCount:   category.VideoCount,
		Translations: translations,
	})
}

// DeleteCategory godoc
// @Summary Delete category
// @Tags categories
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} utils.Response
// @Router /api/v1/categories/{id} [delete]
func (h *CategoryHandler) DeleteCategory(c *fiber.Ctx) error {
	ctx := c.UserContext()

	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequestResponse(c, "Invalid category ID")
	}

	category, err := h.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return utils.NotFoundResponse(c, "Category not found")
		}
		logger.ErrorContext(ctx, "Failed to get category for delete", "category_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	// ตรวจสอบว่ามี video ที่ใช้ category นี้อยู่หรือไม่
	if category.VideoCount > 0 {
		logger.WarnContext(ctx, "Cannot delete category with videos", "category_id", id, "video_count", category.VideoCount)
		return utils.BadRequestResponse(c, "Cannot delete category with associated videos")
	}

	// ลบ translations ก่อน
	if err := h.categoryRepo.DeleteTranslationsByCategoryID(ctx, id); err != nil {
		logger.WarnContext(ctx, "Failed to delete category translations", "category_id", id, "error", err)
	}

	if err := h.categoryRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete category", "category_id", id, "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Category deleted", "category_id", id)
	return utils.SuccessResponse(c, fiber.Map{"message": "Category deleted successfully"})
}

// RefreshVideoCounts godoc
// @Summary Refresh video counts for all categories
// @Tags categories
// @Produce json
// @Success 200 {object} utils.Response
// @Router /api/v1/categories/refresh-counts [post]
func (h *CategoryHandler) RefreshVideoCounts(c *fiber.Ctx) error {
	ctx := c.UserContext()

	if err := h.categoryRepo.RefreshAllVideoCounts(ctx); err != nil {
		logger.ErrorContext(ctx, "Failed to refresh video counts", "error", err)
		return utils.InternalServerErrorResponse(c)
	}

	logger.InfoContext(ctx, "Category video counts refreshed")
	return utils.SuccessResponse(c, fiber.Map{"message": "Video counts refreshed successfully"})
}
