import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryForm } from '@/components/categories/CategoryForm';
import '@testing-library/jest-dom';

// Mock the CategorySelector component
vi.mock('@/components/categories/CategorySelector', () => ({
  CategorySelector: vi.fn(({ value, onChange, disabled, error, placeholder }) => (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
      data-testid="category-selector"
    >
      <option value="">Selecione uma categoria pai</option>
      <option value="parent-1">Alimentação</option>
      <option value="parent-2">Transporte</option>
    </select>
  )),
}));

// Mock Lucide icons - provide a generic component for any icon name
vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => () => <span data-testid={`icon-${name}`}>{name}</span>;

  return {
    // Icons used directly in CategoryForm
    X: createMockIcon('x'),
    Palette: createMockIcon('palette'),
    // All icons from COMMON_ICONS in CategoryForm
    Home: createMockIcon('home'),
    ShoppingCart: createMockIcon('shopping-cart'),
    Car: createMockIcon('car'),
    Bus: createMockIcon('bus'),
    Plane: createMockIcon('plane'),
    Utensils: createMockIcon('utensils'),
    Coffee: createMockIcon('coffee'),
    Heart: createMockIcon('heart'),
    Dumbbell: createMockIcon('dumbbell'),
    Book: createMockIcon('book'),
    Gamepad2: createMockIcon('gamepad-2'),
    Music: createMockIcon('music'),
    Film: createMockIcon('film'),
    Camera: createMockIcon('camera'),
    Smartphone: createMockIcon('smartphone'),
    Laptop: createMockIcon('laptop'),
    Tv: createMockIcon('tv'),
    Headphones: createMockIcon('headphones'),
    Watch: createMockIcon('watch'),
    Shirt: createMockIcon('shirt'),
    ShoppingBag: createMockIcon('shopping-bag'),
    Gift: createMockIcon('gift'),
    CreditCard: createMockIcon('credit-card'),
    Wallet: createMockIcon('wallet'),
    PiggyBank: createMockIcon('piggy-bank'),
    Banknote: createMockIcon('banknote'),
    Coins: createMockIcon('coins'),
    Briefcase: createMockIcon('briefcase'),
    GraduationCap: createMockIcon('graduation-cap'),
    Stethoscope: createMockIcon('stethoscope'),
    Pill: createMockIcon('pill'),
    Syringe: createMockIcon('syringe'),
    Dna: createMockIcon('dna'),
    Leaf: createMockIcon('leaf'),
    Trees: createMockIcon('tree'),
    Flower: createMockIcon('flower'),
    Sun: createMockIcon('sun'),
    Cloud: createMockIcon('cloud'),
    Droplet: createMockIcon('droplet'),
    Flame: createMockIcon('flame'),
    Wind: createMockIcon('wind'),
    Zap: createMockIcon('zap'),
    Battery: createMockIcon('battery'),
    Plug: createMockIcon('plug'),
    Wifi: createMockIcon('wifi'),
    Signal: createMockIcon('signal'),
    Bluetooth: createMockIcon('bluetooth'),
    Usb: createMockIcon('usb'),
    HardDrive: createMockIcon('hard-drive'),
    Database: createMockIcon('database'),
    Server: createMockIcon('server'),
    Cpu: createMockIcon('cpu'),
    MemoryStick: createMockIcon('memory-stick'),
    Monitor: createMockIcon('monitor'),
    Keyboard: createMockIcon('keyboard'),
    Mouse: createMockIcon('mouse'),
    Printer: createMockIcon('printer'),
    Scanner: createMockIcon('scanner'),
    Mic: createMockIcon('mic'),
    Speaker: createMockIcon('speaker'),
    Bell: createMockIcon('bell'),
    AlertTriangle: createMockIcon('alert-triangle'),
    CheckCircle: createMockIcon('check-circle'),
    XCircle: createMockIcon('x-circle'),
    Info: createMockIcon('info'),
    HelpCircle: createMockIcon('help-circle'),
    PlusCircle: createMockIcon('plus-circle'),
    MinusCircle: createMockIcon('minus-circle'),
    ArrowUp: createMockIcon('arrow-up'),
    ArrowDown: createMockIcon('arrow-down'),
    ArrowLeft: createMockIcon('arrow-left'),
    ArrowRight: createMockIcon('arrow-right'),
    ChevronUp: createMockIcon('chevron-up'),
    ChevronDown: createMockIcon('chevron-down'),
    ChevronLeft: createMockIcon('chevron-left'),
    ChevronRight: createMockIcon('chevron-right'),
    Menu: createMockIcon('menu'),
    Check: createMockIcon('check'),
    Star: createMockIcon('star'),
    Flag: createMockIcon('flag'),
    Bookmark: createMockIcon('bookmark'),
    Tag: createMockIcon('tag'),
    Folder: createMockIcon('folder'),
    File: createMockIcon('file'),
    Image: createMockIcon('image'),
    Video: createMockIcon('video'),
    Code: createMockIcon('code'),
    Terminal: createMockIcon('terminal'),
    GitBranch: createMockIcon('git-branch'),
    // Institution icons
    Building: createMockIcon('building'),
    TrendingUp: createMockIcon('trending-up'),
  };
});

describe('CategoryForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(<CategoryForm isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render form when open', () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
  });

  it('should show edit mode title when initialData provided', () => {
    render(
      <CategoryForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{
          id: 'cat-1',
          name: 'Supermercado',
          type: 'EXPENSE',
          parentId: null,
          color: '#EF4444',
          icon: 'shopping-cart',
        }}
      />
    );
    expect(screen.getByText('Editar Categoria')).toBeInTheDocument();
  });

  it('should validate required name field', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    await userEvent.type(nameInput, 'Supermercado');

    // Select type EXPENSE (default)
    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Supermercado',
        type: 'EXPENSE',
      })
    );
  });

  it('should allow selecting category type', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/Nome/i);
    await userEvent.type(nameInput, 'Teste');

    const incomeButton = screen.getByRole('radio', { name: /receita/i });
    await userEvent.click(incomeButton);

    const submitButton = screen.getByRole('button', { name: /criar/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'INCOME' })
    );
  });

  it('should populate form with initialData in edit mode', async () => {
    render(
      <CategoryForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{
          id: 'cat-1',
          name: 'Supermercado',
          type: 'EXPENSE',
          parentId: 'parent-1',
          color: '#EF4444',
          icon: 'shopping-cart',
        }}
      />
    );

    expect(screen.getByLabelText(/Nome/i)).toHaveValue('Supermercado');
    expect(screen.getByRole('radio', { name: /despesa/i })).toBeChecked();
    expect(screen.getByLabelText(/Cor/i)).toHaveValue('#ef4444');
    expect(screen.getByLabelText(/Ícone \(opcional\)/i)).toHaveValue('shopping-cart');
  });

  it('should call onClose when cancel button clicked', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when close button clicked', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const closeButton = screen.getByLabelText('Fechar formulário');
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable form when isLoading', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} isLoading />);

    const nameInput = screen.getByLabelText(/Nome/i);
    expect(nameInput).toBeDisabled();

    const submitButton = screen.getByRole('button', { name: /criar/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show color picker and hex input', () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Selecionar cor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cor/i)).toBeInTheDocument();
  });

  it('should show icon picker grid', () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('Ícone shopping-cart')).toBeInTheDocument();
    expect(screen.getByLabelText('Ícone home')).toBeInTheDocument();
  });

  it('should update icon when icon button clicked', async () => {
    render(<CategoryForm isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

    const homeIconButton = screen.getByLabelText('Ícone home');
    await userEvent.click(homeIconButton);

    expect(screen.getByLabelText(/Ícone \(opcional\)/i)).toHaveValue('home');
  });

  it('should clear icon when X button clicked', async () => {
    render(
      <CategoryForm
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        initialData={{
          id: 'cat-1',
          name: 'Teste',
          type: 'EXPENSE',
          parentId: null,
          color: '#EF4444',
          icon: 'shopping-cart',
        }}
      />
    );

    expect(screen.getByLabelText(/Ícone \(opcional\)/i)).toHaveValue('shopping-cart');

    const clearButton = screen.getByLabelText('Limpar ícone');
    await userEvent.click(clearButton);

    expect(screen.getByLabelText(/Ícone \(opcional\)/i)).toHaveValue('');
  });
});