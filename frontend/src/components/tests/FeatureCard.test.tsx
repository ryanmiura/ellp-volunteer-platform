import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeatureCard from '../FeatureCard';

describe('FeatureCard Component', () => {
  const mockIcon = (
    <svg data-testid="test-icon">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  it('should render with title and description', () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={mockIcon}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        buttonText="Click here"
        onButtonClick={() => {}}
      />
    );

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={mockIcon}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        buttonText="Click here"
        onButtonClick={() => {}}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should render button with correct text', () => {
    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={mockIcon}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        buttonText="View Details"
        onButtonClick={() => {}}
      />
    );

    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('should call onButtonClick when button is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <FeatureCard
        title="Test Feature"
        description="Test description"
        icon={mockIcon}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        buttonText="Click me"
        onButtonClick={handleClick}
      />
    );

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

});
