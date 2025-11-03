import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoCard from '../InfoCard';

describe('InfoCard Component', () => {
  const mockIcon = (
    <svg data-testid="test-icon">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  it('should render with title and description', () => {
    render(
      <InfoCard
        title="Test Info"
        description="Test description"
        icon={mockIcon}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />
    );

    expect(screen.getByText('Test Info')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <InfoCard
        title="Test Info"
        description="Test description"
        icon={mockIcon}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

});
