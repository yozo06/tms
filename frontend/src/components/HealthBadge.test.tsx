import { render, screen } from '@testing-library/react';
import HealthBadge from './HealthBadge';
import { describe, it, expect } from 'vitest';

describe('HealthBadge Component', () => {
    it('renders "No data" when no score is provided', () => {
        render(<HealthBadge />);
        expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('renders a green badge for high scores (>= 8)', () => {
        const { container } = render(<HealthBadge score={9} />);
        expect(container.textContent).toContain('9/10');
        // It should render 4 filled blocks and 1 empty block for score 9
        // Math.round((9 / 10) * 5) = 5 filled blocks, wait, Math.round(4.5) is 5.
        // 5 filled blocks, 0 empty blocks. '█████ '
        expect(container.firstChild).toHaveClass('text-green-600');
    });

    it('renders a yellow badge for medium scores (5-7)', () => {
        const { container } = render(<HealthBadge score={6} />);
        expect(container.textContent).toContain('6/10');
        expect(container.firstChild).toHaveClass('text-yellow-600');
    });

    it('renders a red badge for low scores (< 5)', () => {
        const { container } = render(<HealthBadge score={3} />);
        expect(container.textContent).toContain('3/10');
        expect(container.firstChild).toHaveClass('text-red-600');
    });
});
