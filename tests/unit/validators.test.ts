import { describe, it, expect } from 'vitest';
import {
  createCategorySchema,
  updateCategorySchema,
  createInstitutionSchema,
  updateInstitutionSchema,
  type CreateCategoryInput,
  type CreateInstitutionInput,
} from '@/lib/validators';

describe('Category Validators', () => {
  describe('createCategorySchema', () => {
    it('should validate a valid category input', () => {
      const input: CreateCategoryInput = {
        name: 'Supermercado',
        type: 'EXPENSE',
        parentId: null,
        color: '#EF4444',
        icon: 'shopping-cart',
      };

      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const input = {
        name: '',
        type: 'EXPENSE',
      };

      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((e) => e.path.includes('name'))).toBe(true);
      }
    });

    it('should reject name longer than 100 characters', () => {
      const input = {
        name: 'a'.repeat(101),
        type: 'EXPENSE',
      };

      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate type enum', () => {
      const input = {
        name: 'Teste',
        type: 'INVALID_TYPE',
      };

      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept valid types', () => {
      const validTypes = ['INCOME', 'EXPENSE', 'TRANSFER'] as const;

      validTypes.forEach((type) => {
        const input = { name: 'Teste', type };
        const result = createCategorySchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    it('should validate color hex format', () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#ABCDEF', '#abcdef', '#123456'];
      const invalidColors = ['FF0000', '#FF00', '#GGGGGG', 'red', '#1234567'];

      validColors.forEach((color) => {
        const input = { name: 'Teste', type: 'EXPENSE', color };
        const result = createCategorySchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      invalidColors.forEach((color) => {
        const input = { name: 'Teste', type: 'EXPENSE', color };
        const result = createCategorySchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should validate parentId as CUID or null', () => {
      const validInput = { name: 'Teste', type: 'EXPENSE', parentId: 'clx1234567890abcdef123456' };
      const result = createCategorySchema.safeParse(validInput);
      expect(result.success).toBe(true);

      const nullInput = { name: 'Teste', type: 'EXPENSE', parentId: null };
      const nullResult = createCategorySchema.safeParse(nullInput);
      expect(nullResult.success).toBe(true);

      const invalidInput = { name: 'Teste', type: 'EXPENSE', parentId: 'invalid-id' };
      const invalidResult = createCategorySchema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });

    it('should make icon optional', () => {
      const withIcon = { name: 'Teste', type: 'EXPENSE', icon: 'shopping-cart' };
      const withoutIcon = { name: 'Teste', type: 'EXPENSE' };

      expect(createCategorySchema.safeParse(withIcon).success).toBe(true);
      expect(createCategorySchema.safeParse(withoutIcon).success).toBe(true);
    });

    it('should reject icon longer than 50 characters', () => {
      const input = { name: 'Teste', type: 'EXPENSE', icon: 'a'.repeat(51) };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('updateCategorySchema', () => {
    it('should allow partial updates', () => {
      const input = { name: 'Novo Nome' };
      const result = updateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateCategorySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate fields when provided', () => {
      const input = { color: 'invalid-color' };
      const result = updateCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

describe('Institution Validators', () => {
  describe('createInstitutionSchema', () => {
    it('should validate a valid institution input', () => {
      const input: CreateInstitutionInput = {
        name: 'Nubank',
        type: 'BANK',
        color: '#8B5CF6',
        logoUrl: 'https://example.com/logo.png',
      };

      const result = createInstitutionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const input = {
        name: '',
        type: 'BANK',
      };

      const result = createInstitutionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters', () => {
      const input = {
        name: 'a'.repeat(101),
        type: 'BANK',
      };

      const result = createInstitutionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate type enum', () => {
      const validTypes = ['BANK', 'CREDIT_CARD', 'INVESTMENT', 'OTHER'] as const;

      validTypes.forEach((type) => {
        const input = { name: 'Teste', type };
        const result = createInstitutionSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      const invalidInput = { name: 'Teste', type: 'INVALID' };
      const invalidResult = createInstitutionSchema.safeParse(invalidInput);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate color hex format', () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF'];
      const invalidColors = ['FF0000', '#FF00', 'red'];

      validColors.forEach((color) => {
        const input = { name: 'Teste', type: 'BANK', color };
        const result = createInstitutionSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      invalidColors.forEach((color) => {
        const input = { name: 'Teste', type: 'BANK', color };
        const result = createInstitutionSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should validate logoUrl as URL', () => {
      const validUrls = [
        'https://example.com/logo.png',
        'http://example.com/logo.svg',
        'https://cdn.example.com/path/to/logo.jpg',
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com/logo.png',
        'javascript:alert(1)',
      ];

      validUrls.forEach((logoUrl) => {
        const input = { name: 'Teste', type: 'BANK', logoUrl };
        const result = createInstitutionSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      invalidUrls.forEach((logoUrl) => {
        const input = { name: 'Teste', type: 'BANK', logoUrl };
        const result = createInstitutionSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should make logoUrl optional', () => {
      const withLogo = { name: 'Teste', type: 'BANK', logoUrl: 'https://example.com/logo.png' };
      const withoutLogo = { name: 'Teste', type: 'BANK' };

      expect(createInstitutionSchema.safeParse(withLogo).success).toBe(true);
      expect(createInstitutionSchema.safeParse(withoutLogo).success).toBe(true);
    });
  });

  describe('updateInstitutionSchema', () => {
    it('should allow partial updates', () => {
      const input = { name: 'Novo Nome' };
      const result = updateInstitutionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate fields when provided', () => {
      const input = { type: 'INVALID' };
      const result = updateInstitutionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});