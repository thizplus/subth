package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type ContactChannelService interface {
	// CRUD
	Create(ctx context.Context, req *dto.CreateContactChannelRequest) (*dto.ContactChannelResponse, error)
	GetByID(ctx context.Context, id uuid.UUID) (*dto.ContactChannelResponse, error)
	Update(ctx context.Context, id uuid.UUID, req *dto.UpdateContactChannelRequest) (*dto.ContactChannelResponse, error)
	Delete(ctx context.Context, id uuid.UUID) error

	// List
	List(ctx context.Context, includeInactive bool) ([]dto.ContactChannelResponse, error)

	// Reorder
	Reorder(ctx context.Context, ids []uuid.UUID) error
}
