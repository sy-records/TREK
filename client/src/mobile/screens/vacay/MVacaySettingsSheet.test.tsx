import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../tests/helpers/render'
import { resetAllStores, seedStore } from '../../../../tests/helpers/store'
import { useVacayStore } from '../../../store/vacayStore'
import MVacaySettingsSheet from './MVacaySettingsSheet'

const holidayCalendars = [
  { id: 5, plan_id: 1, region: 'DE', color: '#fecaca', label: null, sort_order: 0 },
  { id: 6, plan_id: 1, region: 'FR', color: '#fed7aa', label: null, sort_order: 1 },
]

vi.mock('../../components/MSheet', () => ({
  default: ({ children, open }: { children: ReactNode; open: boolean }) => open ? <div>{children}</div> : null,
}))

vi.mock('../../../components/Vacay/useSchoolHolidayCountries', () => ({
  useSchoolHolidayCountries: () => ({ countries: [{ value: 'DE', label: 'Germany' }], error: null }),
}))

vi.mock('../../../components/Vacay/useVacaySettings', () => ({
  canAddHolidayCalendar: () => true,
  monthDayCap: () => 31,
  parseHolidayRegion: (value: string) => ({ country: value, region: '' }),
  useLeaveYear: () => ({
    yearSettings: { year_type: 'calendar', year_start_month: 1, year_start_day: 1, hire_date: null },
    type: 'calendar', selectedYear: 2026, save: vi.fn(), windowLabel: 'Jan–Dec',
  }),
  useRegionOptions: () => ({ regions: [], loadingRegions: false, regionError: null }),
  useVacaySettings: () => ({
    countries: [{ value: 'DE', label: 'Germany' }],
    publicHolidayCalendars: holidayCalendars,
    schoolHolidayCalendars: [],
    weekendDays: [], toggleWeekendDay: vi.fn(), dissolveFusion: vi.fn(), confirmingDissolve: false,
    askDissolve: vi.fn(), cancelDissolve: vi.fn(),
  }),
}))

describe('MVacaySettingsSheet color picker', () => {
  beforeEach(() => {
    resetAllStores()
    seedStore(useVacayStore, {
      plan: {
        id: 1, block_weekends: false, weekend_days: '0,6', carry_over_enabled: false,
        company_holidays_enabled: false, holidays_enabled: true, school_holidays_enabled: false,
        holiday_calendars: holidayCalendars,
      },
      isFused: false,
      users: [],
    })
  })

  it('opens only one palette at a time, displays 12 colors, and closes on outside tap', async () => {
    const user = userEvent.setup()
    render(<MVacaySettingsSheet open onClose={vi.fn()} />)

    const colorButtons = screen.getAllByRole('button').filter(button => button.className.includes('h-[26px] w-[26px]'))
    await user.click(colorButtons[0])
    const swatches = screen.getAllByRole('button', { name: /^#[0-9a-f]{6}$/i })
    expect(swatches).toHaveLength(12)
    expect(swatches[0].parentElement?.className).toContain('w-[118px]')

    await user.click(colorButtons[1])
    expect(screen.getAllByRole('button', { name: /^#[0-9a-f]{6}$/i })).toHaveLength(12)

    await user.click(document.body)
    expect(screen.queryAllByRole('button', { name: /^#[0-9a-f]{6}$/i })).toHaveLength(0)
  })
})
