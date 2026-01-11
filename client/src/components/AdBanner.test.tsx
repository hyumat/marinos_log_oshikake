import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdBanner } from './AdBanner';

// useAuth のモック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('AdBanner', () => {
  it('Freeプランのユーザーには広告を表示', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { openId: 'user1', name: 'Test User', plan: 'free' },
      isLoading: false,
    } as any);

    render(<AdBanner placement="matchLog" />);
    
    expect(screen.getByText('広告')).toBeInTheDocument();
    expect(screen.getByText('広告枠（プレースホルダ）')).toBeInTheDocument();
  });

  it('Plusプランのユーザーには広告を表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { openId: 'user1', name: 'Test User', plan: 'plus' },
      isLoading: false,
    } as any);

    const { container } = render(<AdBanner placement="matchLog" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('Proプランのユーザーには広告を表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { openId: 'user1', name: 'Test User', plan: 'pro' },
      isLoading: false,
    } as any);

    const { container } = render(<AdBanner placement="matchLog" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('未ログインユーザーには広告を表示', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
    } as any);

    render(<AdBanner placement="matchLog" />);
    
    expect(screen.getByText('広告')).toBeInTheDocument();
    expect(screen.getByText('広告枠（プレースホルダ）')).toBeInTheDocument();
  });

  it('placementに応じて正しいラベルを表示', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { openId: 'user1', name: 'Test User', plan: 'free' },
      isLoading: false,
    } as any);

    const { rerender } = render(<AdBanner placement="matchLog" />);
    expect(screen.getByText('マッチログ一覧')).toBeInTheDocument();

    rerender(<AdBanner placement="stats" />);
    expect(screen.getByText('集計ページ')).toBeInTheDocument();

    rerender(<AdBanner placement="home" />);
    expect(screen.getByText('ホームページ')).toBeInTheDocument();
  });

  it('data-ad-placement属性が正しく設定される', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { openId: 'user1', name: 'Test User', plan: 'free' },
      isLoading: false,
    } as any);

    render(<AdBanner placement="matchLog" />);
    
    const adElement = screen.getByText('広告枠（プレースホルダ）').closest('div');
    expect(adElement).toHaveAttribute('data-ad-placement', 'matchLog');
  });
});
