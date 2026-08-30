import { render, screen } from '@testing-library/react'
import { App } from './App'

test('renders the study-site identity', () => {
  render(<App />)
  expect(screen.getByText('2026 咨询实务题库', { selector: 'strong' })).toBeInTheDocument()
})
