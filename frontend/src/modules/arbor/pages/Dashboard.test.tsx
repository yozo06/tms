import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock API calls
const mockGetDashboardStats = vi.fn()
const mockGetBiodiversityIndex = vi.fn()
const mockGetTrees = vi.fn()
vi.mock('../api/dashboard', () => ({
  getDashboardStats: (...args: any[]) => mockGetDashboardStats(...args),
  getBiodiversityIndex: (...args: any[]) => mockGetBiodiversityIndex(...args),
}))
vi.mock('../api/trees', () => ({
  getTrees: (...args: any[]) => mockGetTrees(...args),
}))

// Mock auth store
const mockUser = { id: 1, name: 'Yogesh Zope', email: 'y@test.com', role: 'owner' }
const mockIsOwner = vi.fn(() => true)
vi.mock('../../../core/store/auth.store', () => ({
  useAuthStore: () => ({ user: mockUser, isOwner: mockIsOwner }),
}))

// Mock ProjectSwitcher (it fetches projects on mount)
vi.mock('../../../core/components/ProjectSwitcher', () => ({
  default: () => <div data-testid="project-switcher">ProjectSwitcher</div>,
}))

// Mock Spinner
vi.mock('../../../core/components/Spinner', () => ({
  default: ({ label }: { label?: string }) => <div data-testid="spinner">{label}</div>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus">+</span>,
  AlertTriangle: () => <span data-testid="icon-alert">!</span>,
  CheckCircle2: () => <span data-testid="icon-check">✓</span>,
  Clock: () => <span data-testid="icon-clock">⏰</span>,
  Download: () => <span data-testid="icon-download">↓</span>,
  Leaf: () => <span data-testid="icon-leaf">🍃</span>,
  QrCode: () => <span data-testid="icon-qr">▣</span>,
}))

import Dashboard from './Dashboard'

// Standard mock data
const mockStats = {
  stats: {
    total: 120,
    completed: 45,
    toCut: 15,
    toTrim: 20,
    pending: 30,
    inProgress: 25,
  },
  zones: [
    { zone_code: 'Z-A', zone_name: 'Coffee Block', total_trees: 50, completed: 20 },
    { zone_code: 'Z-B', zone_name: 'Bamboo Grove', total_trees: 70, completed: 25 },
  ],
}

const mockUrgentTrees = [
  { id: 10, tree_code: 'T-010', custom_common_name: 'Dying Jackfruit', action: 'treat', species: null },
  { id: 11, tree_code: 'T-011', custom_common_name: null, action: 'cut', species: { common_name: 'Silver Oak' } },
]

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetDashboardStats.mockResolvedValue(mockStats)
    mockGetBiodiversityIndex.mockResolvedValue({
      shannon_h: 1.5,
      shannon_evenness: 0.75,
      species_richness: 4,
      interpretation: 'Good diversity',
      species_breakdown: [],
    })
    mockGetTrees.mockResolvedValue({ trees: mockUrgentTrees })
    mockIsOwner.mockReturnValue(true)
  })

  it('shows spinner while loading', () => {
    // Never resolve the promise to keep loading state
    mockGetDashboardStats.mockReturnValue(new Promise(() => {}))
    mockGetTrees.mockReturnValue(new Promise(() => {}))
    render(<Dashboard />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders welcome greeting with first name', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Welcome, Yogesh')).toBeInTheDocument()
    })
  })

  it('renders all four stat cards with correct values', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('Total Trees')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('To Cut')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('To Trim')).toBeInTheDocument()
    })
  })

  it('renders overall progress percentage correctly', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      // (45/120)*100 = 37.5 → Math.round = 38%
      expect(screen.getByText('38%')).toBeInTheDocument()
    })
  })

  it('renders status breakdown in progress section', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText(/30 pending/)).toBeInTheDocument()
      expect(screen.getByText(/25 in progress/)).toBeInTheDocument()
      expect(screen.getByText(/45 done/)).toBeInTheDocument()
    })
  })

  it('renders urgent trees section when urgent trees exist', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Dying Jackfruit')).toBeInTheDocument()
      expect(screen.getByText('T-010')).toBeInTheDocument()
      expect(screen.getByText('Silver Oak')).toBeInTheDocument()
      expect(screen.getByText('T-011')).toBeInTheDocument()
    })
  })

  it('does not render urgent section when no urgent trees', async () => {
    mockGetTrees.mockResolvedValue({ trees: [] })
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Welcome, Yogesh')).toBeInTheDocument()
    })
    expect(screen.queryByText('Urgent')).not.toBeInTheDocument()
  })

  it('renders zone breakdown', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Coffee Block')).toBeInTheDocument()
      expect(screen.getByText('Z-A')).toBeInTheDocument()
      expect(screen.getByText('50 trees')).toBeInTheDocument()
      expect(screen.getByText('20 done')).toBeInTheDocument()
      expect(screen.getByText('Bamboo Grove')).toBeInTheDocument()
    })
  })

  it('does not render zone section when no zones', async () => {
    mockGetDashboardStats.mockResolvedValue({ ...mockStats, zones: [] })
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Welcome, Yogesh')).toBeInTheDocument()
    })
    expect(screen.queryByText('By Zone')).not.toBeInTheDocument()
  })

  it('shows add-tree button for owners', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByLabelText('Add new tree')).toBeInTheDocument()
    })
  })

  it('hides add-tree button for non-owners', async () => {
    mockIsOwner.mockReturnValue(false)
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Welcome, Yogesh')).toBeInTheDocument()
    })
    expect(screen.queryByLabelText('Add new tree')).not.toBeInTheDocument()
  })

  it('renders project switcher', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByTestId('project-switcher')).toBeInTheDocument()
    })
  })

  it('handles zero total trees without division error', async () => {
    mockGetDashboardStats.mockResolvedValue({
      ...mockStats,
      stats: { ...mockStats.stats, total: 0, completed: 0 },
    })
    render(<Dashboard />)
    await waitFor(() => {
      // (0 / (0||1)) * 100 = 0%
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })
})
