import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import VersionCompare from '../version-compare'

const versions = [
  {
    change_summary: 'Updated introduction',
    id: 'v3',
    markdownText: 'Line one\nLine two\nLine three new',
    version_date: '2024-03-01T00:00:00Z',
    version_number: 3
  },
  {
    change_summary: null,
    id: 'v2',
    markdownText: 'Line one\nLine two\nLine three old',
    version_date: '2024-02-01T00:00:00Z',
    version_number: 2
  },
  {
    change_summary: 'Initial version',
    id: 'v1',
    markdownText: 'Line one\nLine two',
    version_date: '2024-01-01T00:00:00Z',
    version_number: 1
  }
]

describe('VersionCompare', () => {
  it('renders a list of versions', () => {
    render(<VersionCompare versions={versions} />)

    expect(screen.getByText('バージョン 3')).toBeInTheDocument()
    expect(screen.getByText('バージョン 2')).toBeInTheDocument()
    expect(screen.getByText('バージョン 1')).toBeInTheDocument()
  })

  it('marks the first version as latest', () => {
    render(<VersionCompare versions={versions} />)

    expect(screen.getByText('最新')).toBeInTheDocument()
  })

  it('renders change summaries when available', () => {
    render(<VersionCompare versions={versions} />)

    expect(screen.getByText('Updated introduction')).toBeInTheDocument()
    expect(screen.getByText('Initial version')).toBeInTheDocument()
  })

  it('renders checkboxes for each version', () => {
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(versions.length)
  })

  it('shows hint after selecting first version', async () => {
    const user = userEvent.setup()
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(
      screen.getByText('比較するもう一つのバージョンを選択してください。')
    ).toBeInTheDocument()
  })

  it('shows diff result after selecting two versions', async () => {
    const user = userEvent.setup()
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[2])

    expect(
      screen.getByRole('region', { name: 'バージョン比較結果' })
    ).toBeInTheDocument()
  })

  it('shows version numbers in diff heading', async () => {
    const user = userEvent.setup()
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[2]) // v1
    await user.click(checkboxes[0]) // v3

    expect(screen.getByText(/バージョン比較: v1 → v3/)).toBeInTheDocument()
  })

  it('resets comparison when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[2])

    const resetButton = screen.getByRole('button', {
      name: 'バージョン比較をリセット'
    })
    await user.click(resetButton)

    expect(
      screen.queryByRole('region', { name: 'バージョン比較結果' })
    ).not.toBeInTheDocument()
  })

  it('deselects a version when its checkbox is clicked again', async () => {
    const user = userEvent.setup()
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[0])

    expect(
      screen.queryByText('比較するもう一つのバージョンを選択してください。')
    ).not.toBeInTheDocument()
  })

  it('shows added and removed lines in diff', async () => {
    const user = userEvent.setup()
    render(<VersionCompare versions={versions} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[2]) // v1: "Line one\nLine two"
    await user.click(checkboxes[1]) // v2: "Line one\nLine two\nLine three old"

    const region = screen.getByRole('region', { name: 'バージョン比較結果' })
    expect(region).toBeInTheDocument()
    expect(screen.getByText('Line three old')).toBeInTheDocument()
  })

  it('renders with empty versions array gracefully', () => {
    render(<VersionCompare versions={[]} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
