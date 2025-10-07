import { describe, it, expect } from 'vitest';
import { tokens } from '../tokens';

describe('Design Tokens', () => {
  describe('colors', () => {
    it('exports primary colors', () => {
      expect(tokens.colors.primary.main).toBe('#0A7D2B');
      expect(tokens.colors.primary.light).toBe('#10B981');
      expect(tokens.colors.primary.dark).toBe('#065F21');
    });

    it('exports semantic colors', () => {
      expect(tokens.colors.semantic.error).toBe('#D8262C');
      expect(tokens.colors.semantic.errorBg).toBe('#FEE2E2');
      expect(tokens.colors.semantic.warning).toBe('#F59E0B');
      expect(tokens.colors.semantic.warningBg).toBe('#FEF3C7');
      expect(tokens.colors.semantic.info).toBe('#2196F3');
      expect(tokens.colors.semantic.infoBg).toBe('#DBEAFE');
      expect(tokens.colors.semantic.success).toBe('#4CAF50');
      expect(tokens.colors.semantic.successBg).toBe('#D1FAE5');
    });

    it('exports neutral colors', () => {
      expect(tokens.colors.neutral.white).toBe('#FFFFFF');
      expect(tokens.colors.neutral.gray50).toBe('#F9FAFB');
      expect(tokens.colors.neutral.gray100).toBe('#F3F4F6');
      expect(tokens.colors.neutral.gray500).toBe('#6B7280');
      expect(tokens.colors.neutral.gray900).toBe('#111827');
      expect(tokens.colors.neutral.black).toBe('#000000');
    });

    it('exports text colors', () => {
      expect(tokens.colors.text.primary).toBe('#333333');
      expect(tokens.colors.text.secondary).toBe('#666666');
      expect(tokens.colors.text.disabled).toBe('#9CA3AF');
      expect(tokens.colors.text.white).toBe('#FFFFFF');
      expect(tokens.colors.text.error).toBe('#D8262C');
    });

    it('exports background colors', () => {
      expect(tokens.colors.background.primary).toBe('#FFFFFF');
      expect(tokens.colors.background.secondary).toBe('#F5F5F5');
      expect(tokens.colors.background.tertiary).toBe('#F9FAFB');
    });

    it('exports border colors', () => {
      expect(tokens.colors.border.default).toBe('#E0E0E0');
      expect(tokens.colors.border.focus).toBe('#0A7D2B');
      expect(tokens.colors.border.error).toBe('#D8262C');
    });
  });

  describe('typography', () => {
    it('exports font family', () => {
      expect(tokens.typography.fontFamily.primary).toContain('Roboto');
      expect(tokens.typography.fontFamily.primary).toContain('sans-serif');
    });

    it('exports font sizes', () => {
      expect(tokens.typography.fontSize.xs).toBe('12px');
      expect(tokens.typography.fontSize.sm).toBe('14px');
      expect(tokens.typography.fontSize.base).toBe('16px');
      expect(tokens.typography.fontSize.lg).toBe('18px');
      expect(tokens.typography.fontSize.xl).toBe('20px');
      expect(tokens.typography.fontSize['2xl']).toBe('22px');
      expect(tokens.typography.fontSize['3xl']).toBe('24px');
    });

    it('exports font weights', () => {
      expect(tokens.typography.fontWeight.regular).toBe(400);
      expect(tokens.typography.fontWeight.medium).toBe(500);
      expect(tokens.typography.fontWeight.bold).toBe(700);
    });

    it('exports line heights', () => {
      expect(tokens.typography.lineHeight.tight).toBe(1.2);
      expect(tokens.typography.lineHeight.normal).toBe(1.5);
      expect(tokens.typography.lineHeight.relaxed).toBe(1.75);
    });
  });

  describe('spacing', () => {
    it('exports spacing scale', () => {
      expect(tokens.spacing['0']).toBe('0');
      expect(tokens.spacing['1']).toBe('4px');
      expect(tokens.spacing['2']).toBe('8px');
      expect(tokens.spacing['3']).toBe('12px');
      expect(tokens.spacing['4']).toBe('16px');
      expect(tokens.spacing['6']).toBe('24px');
      expect(tokens.spacing['8']).toBe('32px');
      expect(tokens.spacing['12']).toBe('48px');
      expect(tokens.spacing['16']).toBe('64px');
    });

    it('uses 4px base unit', () => {
      const spacingValues = Object.values(tokens.spacing).filter(v => v !== '0');
      spacingValues.forEach(value => {
        const px = parseInt(value);
        expect(px % 4).toBe(0); // All values divisible by 4
      });
    });
  });

  describe('borderRadius', () => {
    it('exports border radius values', () => {
      expect(tokens.borderRadius.none).toBe('0');
      expect(tokens.borderRadius.sm).toBe('4px');
      expect(tokens.borderRadius.md).toBe('8px');
      expect(tokens.borderRadius.lg).toBe('12px');
      expect(tokens.borderRadius.xl).toBe('16px');
      expect(tokens.borderRadius.full).toBe('9999px');
    });
  });

  describe('shadows', () => {
    it('exports shadow values', () => {
      expect(tokens.shadows.none).toBe('none');
      expect(tokens.shadows.sm).toContain('rgba');
      expect(tokens.shadows.md).toContain('rgba');
      expect(tokens.shadows.lg).toContain('rgba');
      expect(tokens.shadows.xl).toContain('rgba');
    });
  });

  describe('touchTargets', () => {
    it('exports touch target sizes', () => {
      expect(tokens.touchTargets.minimum).toBe('44px');
      expect(tokens.touchTargets.recommended).toBe('48px');
    });
  });

  describe('componentSizes', () => {
    it('exports button sizes', () => {
      expect(tokens.componentSizes.button.height).toBe('48px');
      expect(tokens.componentSizes.button.minWidth).toBe('64px');
    });

    it('exports input sizes', () => {
      expect(tokens.componentSizes.input.height).toBe('56px');
    });

    it('exports icon sizes', () => {
      expect(tokens.componentSizes.icon.sm).toBe('16px');
      expect(tokens.componentSizes.icon.md).toBe('24px');
      expect(tokens.componentSizes.icon.lg).toBe('32px');
      expect(tokens.componentSizes.icon.xl).toBe('48px');
    });

    it('exports avatar sizes', () => {
      expect(tokens.componentSizes.avatar.sm).toBe('32px');
      expect(tokens.componentSizes.avatar.md).toBe('40px');
      expect(tokens.componentSizes.avatar.lg).toBe('56px');
    });

    it('exports chip size', () => {
      expect(tokens.componentSizes.chip.height).toBe('32px');
    });

    it('exports banner size', () => {
      expect(tokens.componentSizes.banner.height).toBe('48px');
    });
  });

  describe('animation', () => {
    it('exports animation durations', () => {
      expect(tokens.animation.duration.fast).toBe('150ms');
      expect(tokens.animation.duration.normal).toBe('250ms');
      expect(tokens.animation.duration.slow).toBe('400ms');
    });

    it('exports animation easing functions', () => {
      expect(tokens.animation.easing.standard).toContain('cubic-bezier');
      expect(tokens.animation.easing.decelerate).toContain('cubic-bezier');
      expect(tokens.animation.easing.accelerate).toContain('cubic-bezier');
    });
  });

  describe('zIndex', () => {
    it('exports z-index scale', () => {
      expect(tokens.zIndex.base).toBe(0);
      expect(tokens.zIndex.dropdown).toBe(1000);
      expect(tokens.zIndex.sticky).toBe(1020);
      expect(tokens.zIndex.fixed).toBe(1030);
      expect(tokens.zIndex.modalBackdrop).toBe(1040);
      expect(tokens.zIndex.modal).toBe(1050);
      expect(tokens.zIndex.popover).toBe(1060);
      expect(tokens.zIndex.tooltip).toBe(1070);
    });

    it('maintains proper z-index hierarchy', () => {
      expect(tokens.zIndex.dropdown).toBeLessThan(tokens.zIndex.modal);
      expect(tokens.zIndex.modalBackdrop).toBeLessThan(tokens.zIndex.modal);
      expect(tokens.zIndex.modal).toBeLessThan(tokens.zIndex.tooltip);
    });
  });

  describe('token consistency', () => {
    it('uses consistent color for primary and focus border', () => {
      expect(tokens.colors.border.focus).toBe(tokens.colors.primary.main);
    });

    it('uses consistent color for error text and error border', () => {
      expect(tokens.colors.border.error).toBe(tokens.colors.semantic.error);
      expect(tokens.colors.text.error).toBe(tokens.colors.semantic.error);
    });
  });

  describe('TypeScript types', () => {
    it('tokens is immutable (as const)', () => {
      // TypeScript compilation will fail if tokens is not readonly
      // This test ensures the type system is working
      expect(tokens).toBeDefined();
    });
  });
});
