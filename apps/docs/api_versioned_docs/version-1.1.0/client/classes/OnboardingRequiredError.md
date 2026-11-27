# Class: OnboardingRequiredError

Thrown by `client.login()` when a user account has not picked a username yet.
The token stays set, so `client.auth.completeOnboarding(username)` works straight away.

## Extends

- `Error`

## Constructors

### Constructor

> **new OnboardingRequiredError**(): `OnboardingRequiredError`

#### Returns

`OnboardingRequiredError`

#### Overrides

`Error.constructor`
