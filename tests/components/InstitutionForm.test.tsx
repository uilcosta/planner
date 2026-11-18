import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstitutionForm } from '@/components/institutions/InstitutionForm';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x">X</span>,
  Building: () => <span data-testid="icon-building">🏦</span>,
  CreditCard: () => <span data-testid="icon-credit-card">💳</span>,
  TrendingUp: () => <span data-testid="icon-trending-up">📈</span>,
  Briefcase: () => <span data-testid="icon-briefcase">💼</span>,
  Plus: () => <span data-testid="icon-plus">+</span>,
}));

describe('InstitutionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(<InstitutionForm isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render form when open', () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nova Instituição')).toBeInTheDocument();
  });

  it('should show edit mode title when initialData provided', () => {
    render(
      <InstitutionForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{
          id: 'inst-1',
          name: 'Nubank',
          type: 'BANK',
          color: '#8B5CF6',
          logoUrl: 'https://example.com/logo.png',
        }}
      />
    );
    expect(screen.getByText('Editar Instituição')).toBeInTheDocument();
  });

  it('should validate required name field', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    await userEvent.type(nameInput, 'Nubank');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nubank',
        type: 'BANK',
      })
    );
  });

  it('should allow selecting institution type', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    await userEvent.type(nameInput, 'Teste');

    const creditCardButton = screen.getByRole('radio', { name: /cartão de crédito/i });
    await userEvent.click(creditCardButton);

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CREDIT_CARD' })
    );
  });

  it('should populate form with initialData in edit mode', async () => {
    render(
      <InstitutionForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{
          id: 'inst-1',
          name: 'Nubank',
          type: 'BANK',
          color: '#8B5CF6',
          logoUrl: 'https://example.com/logo.png',
        }}
      />
    );

    expect(screen.getByLabelText(/Nome/i)).toHaveValue('Nubank');
    expect(screen.getByRole('radio', { name: /banco/i })).toBeChecked();
    expect(screen.getByLabelText(/Cor/i)).toHaveValue('#8b5cf6');
    expect(screen.getByLabelText(/URL do Logo \(opcional\)/i)).toHaveValue('https://example.com/logo.png');
  });

  it('should call onClose when cancel button clicked', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button clicked', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const closeButton = screen.getByLabelText('Fechar formulário');
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable form when isLoading', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isLoading />);

    const nameInput = screen.getByLabelText(/Nome/i);
    expect(nameInput).toBeDisabled();

    const submitButton = screen.getByRole('button', { name: /criar/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show color picker and hex input', () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Selecionar cor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cor/i)).toBeInTheDocument();
  });

  it('should validate logoUrl as URL', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    await userEvent.type(nameInput, 'Teste');

    const logoInput = screen.getByLabelText(/URL do Logo \(opcional\)/i);
    await userEvent.type(logoInput, 'not-a-url');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText('URL do logo deve usar protocolo http ou https')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should accept valid logoUrl', async () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    await userEvent.type(nameInput, 'Teste');

    const logoInput = screen.getByLabelText(/URL do Logo \(opcional\)/i);
    await userEvent.type(logoInput, 'https://example.com/logo.png');

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        logoUrl: 'https://example.com/logo.png',
      })
    );
  });

  it('should show preview with selected type icon', () => {
    render(<InstitutionForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    // Default type is BANK - check preview area specifically
    const preview = screen.getByText('Pré-visualização').closest('div');
    expect(preview).toBeInTheDocument();
    expect(preview!.querySelector('[data-testid="icon-building"]')).toBeInTheDocument();

    // Change to CREDIT_CARD
    fireEvent.click(screen.getByRole('radio', { name: /cartão de crédito/i }));
    expect(preview!.querySelector('[data-testid="icon-credit-card"]')).toBeInTheDocument();
  });
});