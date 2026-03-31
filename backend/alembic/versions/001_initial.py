"""Initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'drivers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('status', sa.Enum('active', 'inactive', 'on_leave', name='driverstatus'), nullable=True),
        sa.Column('truck_number', sa.String(length=50), nullable=True),
        sa.Column('trailer_number', sa.String(length=50), nullable=True),
        sa.Column('pay_type', sa.Enum('freight_percent', 'flat_rate', 'per_mile', name='paytype'), nullable=True),
        sa.Column('pay_rate', sa.Float(), nullable=True),
        sa.Column('cdl_number', sa.String(length=100), nullable=True),
        sa.Column('cdl_expiration', sa.Date(), nullable=True),
        sa.Column('medical_card_expiration', sa.Date(), nullable=True),
        sa.Column('drug_test_date', sa.Date(), nullable=True),
        sa.Column('drug_test_result', sa.String(length=20), nullable=True),
        sa.Column('mvr_date', sa.Date(), nullable=True),
        sa.Column('mvr_status', sa.String(length=20), nullable=True),
        sa.Column('notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index(op.f('ix_drivers_id'), 'drivers', ['id'], unique=False)

    op.create_table(
        'settlements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('settlement_number', sa.String(length=50), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=False),
        sa.Column('phase_label', sa.String(length=100), nullable=False),
        sa.Column('phase_start_date', sa.DateTime(), nullable=False),
        sa.Column('phase_end_date', sa.DateTime(), nullable=False),
        sa.Column('gross_revenue', sa.Float(), nullable=True),
        sa.Column('driver_percentage', sa.Float(), nullable=True),
        sa.Column('driver_gross', sa.Float(), nullable=True),
        sa.Column('deductions', sa.JSON(), nullable=True),
        sa.Column('total_deductions', sa.Float(), nullable=True),
        sa.Column('grand_total', sa.Float(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'finalized', 'paid', name='settlementstatus'), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('pdf_path', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finalized_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('settlement_number'),
    )
    op.create_index(op.f('ix_settlements_id'), 'settlements', ['id'], unique=False)
    op.create_index(op.f('ix_settlements_settlement_number'), 'settlements', ['settlement_number'], unique=True)

    op.create_table(
        'loads',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('load_number', sa.String(length=50), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=True),
        sa.Column('broker_name', sa.String(length=200), nullable=True),
        sa.Column('broker_contact', sa.String(length=200), nullable=True),
        sa.Column('broker_phone', sa.String(length=30), nullable=True),
        sa.Column('broker_email', sa.String(length=255), nullable=True),
        sa.Column('broker_mc', sa.String(length=50), nullable=True),
        sa.Column('pickup_city', sa.String(length=100), nullable=False),
        sa.Column('pickup_state', sa.String(length=10), nullable=False),
        sa.Column('pickup_zip', sa.String(length=20), nullable=True),
        sa.Column('pickup_date', sa.Date(), nullable=False),
        sa.Column('pickup_time', sa.String(length=20), nullable=True),
        sa.Column('shipper_name', sa.String(length=200), nullable=True),
        sa.Column('shipper_address', sa.Text(), nullable=True),
        sa.Column('delivery_city', sa.String(length=100), nullable=False),
        sa.Column('delivery_state', sa.String(length=10), nullable=False),
        sa.Column('delivery_zip', sa.String(length=20), nullable=True),
        sa.Column('delivery_date', sa.Date(), nullable=False),
        sa.Column('delivery_time', sa.String(length=20), nullable=True),
        sa.Column('consignee_name', sa.String(length=200), nullable=True),
        sa.Column('consignee_address', sa.Text(), nullable=True),
        sa.Column('rate', sa.Float(), nullable=False),
        sa.Column('detention', sa.Float(), nullable=True),
        sa.Column('lumper_cost', sa.Float(), nullable=True),
        sa.Column('fuel_surcharge', sa.Float(), nullable=True),
        sa.Column('total_rate', sa.Float(), nullable=True),
        sa.Column('status', sa.Enum('new', 'picked_up', 'en_route', 'delivered', 'cancelled', 'tonu', name='loadstatus'), nullable=True),
        sa.Column('commodity', sa.String(length=200), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True),
        sa.Column('miles', sa.Integer(), nullable=True),
        sa.Column('equipment_type', sa.String(length=50), nullable=True),
        sa.Column('reference_number', sa.String(length=100), nullable=True),
        sa.Column('po_number', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('settlement_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ),
        sa.ForeignKeyConstraint(['settlement_id'], ['settlements.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('load_number'),
    )
    op.create_index(op.f('ix_loads_id'), 'loads', ['id'], unique=False)
    op.create_index(op.f('ix_loads_load_number'), 'loads', ['load_number'], unique=True)
    op.create_index(op.f('ix_loads_status'), 'loads', ['status'], unique=False)

    op.create_table(
        'attachments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('load_id', sa.Integer(), nullable=False),
        sa.Column('attachment_type', sa.Enum('rate_confirmation', 'bol', 'lumper_receipt', 'pod', 'other', name='attachmenttype'), nullable=False),
        sa.Column('filename', sa.String(length=500), nullable=False),
        sa.Column('original_filename', sa.String(length=500), nullable=False),
        sa.Column('file_path', sa.String(length=1000), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('mime_type', sa.String(length=100), nullable=True),
        sa.Column('uploaded_by', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['load_id'], ['loads.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_attachments_id'), 'attachments', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('attachments')
    op.drop_table('loads')
    op.drop_table('settlements')
    op.drop_table('drivers')
    op.execute("DROP TYPE IF EXISTS attachmenttype")
    op.execute("DROP TYPE IF EXISTS loadstatus")
    op.execute("DROP TYPE IF EXISTS settlementstatus")
    op.execute("DROP TYPE IF EXISTS paytype")
    op.execute("DROP TYPE IF EXISTS driverstatus")
