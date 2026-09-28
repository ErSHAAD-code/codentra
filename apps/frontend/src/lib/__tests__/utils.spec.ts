import { cn } from '../utils';

describe('cn', () => {
  it('merges plain class strings', () => {
    expect(cn('p-2', 'text-sm')).toBe('p-2 text-sm');
  });

  it('resolves Tailwind conflicts, keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('drops falsy values from conditional classes', () => {
    expect(cn('p-2', false && 'hidden', undefined, null)).toBe('p-2');
  });

  it('applies a conditional class when its condition is true', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });
});
