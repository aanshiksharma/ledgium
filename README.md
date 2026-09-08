# Ledgium

> **Shared finances, kept clear.**

Ledgium is a full-stack household finance platform designed to make shared money management simple, transparent, and auditable.

It helps households keep track of **accounts, shared transactions, balances, and settlements** without losing sight of who paid, who owes whom, and how the current financial state was calculated.

Unlike a simple expense tracker, Ledgium treats financial records as a structured ledger: transactions are preserved, balances are derived from recorded activity, and settlements represent actual transfers of money between people.

---

## ✨ What is Ledgium?

Managing money in a household can become surprisingly difficult when multiple people contribute to expenses.

For example:

- One person pays the electricity bill.
- Another pays for groceries.
- Someone else pays rent.
- Several people share those expenses differently.
- Later, people settle their outstanding balances.

Ledgium provides a central place to record these events and determine the resulting financial position.

### Example

Suppose Alice pays **₹1,000** for an expense shared equally between Alice, Bob, Charlie, and David.

Each person's share is ₹250.

Ledgium records:

```text
Alice paid:       ₹1,000
Alice's share:      ₹250
Bob owes Alice:     ₹250
Charlie owes Alice: ₹250
David owes Alice:   ₹250
```

If Bob later pays Alice ₹250, that settlement is recorded separately and Bob's outstanding obligation is reduced.

The system therefore distinguishes between:

**What happened** → transactions
**Who owes whom** → derived balances
**What has actually been paid back** → settlements

---

# 🎯 Core Goals

Ledgium is built around a few fundamental principles.

### 1. Accurate financial records

Every financial event should be represented explicitly rather than inferred from UI state.

### 2. Deterministic balances

Balances should be calculated from recorded transactions and settlements, not manually maintained by the frontend.

### 3. Auditability

Financial records should remain traceable. Important actions such as edits and voiding should not silently erase history.

### 4. Clear household boundaries

Household financial data belongs to the household and should only be accessible to authorized members.

### 5. Precise money handling

Financial calculations use **integer paise** internally rather than floating-point currency values.

For example:

```text
₹100.50 → 10050 paise
```

This avoids floating-point precision problems in monetary calculations.

---

# 🧩 Core Features

Ledgium currently focuses on the following capabilities:

- 👤 User authentication
- 🏠 Household management
- 👥 Household membership
- 💳 Account management
- 💰 Transaction recording
- 🔀 Expense splitting
- 📊 Derived household balances
- 🤝 Settlement tracking
- 🧾 Historical financial records
- 🔐 Authorization and household-level access control
- 🧪 Automated backend integration testing

The project is being developed incrementally, so some planned product capabilities may not yet be implemented.

---

# 🏗️ Architecture

At a high level, Ledgium follows a conventional full-stack architecture:

```text
                    ┌──────────────────┐
                    │     Frontend     │
                    │   Web Interface  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    API Layer     │
                    │ Routes / Handlers│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Authentication & │
                    │  Authorization   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Validation &     │
                    │ Domain Logic     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Persistence    │
                    │     MongoDB      │
                    └──────────────────┘
```

The backend is the authoritative source for financial state.

The frontend should **display and interact with financial data**, rather than independently becoming a second accounting engine.

---

# 🧱 Domain Model

The core domain consists of several entities.

## User

Represents an individual using Ledgium.

A user can belong to one or more household contexts depending on the application's membership model.

---

## Household

Represents a group of people managing shared finances.

A household has:

- An owner/creator
- Members
- Financial records
- Household-level access rules

---

## Household Membership

Connects a user to a household.

Membership can contain information such as:

```text
User
  │
  └── Membership
        ├── Household
        ├── Role
        ├── Status
        └── Membership timestamps
```

Authorization is evaluated using household membership rather than simply trusting identifiers supplied by the client.

---

## Account

Represents a financial account associated with a user.

Accounts provide a structured representation of where money is held or managed.

Account creation and listing are covered by the backend integration test suite.

---

## Transaction

A transaction represents a financial event.

Conceptually, it contains information such as:

```text
Transaction
├── Household / context
├── Creator
├── Payer
├── Amount
├── Date
├── Description
├── Category
├── Split mode
├── Participants / shares
└── Status
```

Transactions are the primary source from which household obligations are derived.

---

## Settlement

A settlement represents an actual transfer between participants.

For example:

```text
Bob ───── ₹250 ─────► Alice
```

A settlement reduces the corresponding outstanding obligation.

Settlements are recorded independently of the original transaction so that financial history remains meaningful.

---

## Audit Event

Important changes can be represented through audit information containing concepts such as:

- Actor
- Entity
- Action
- Previous state
- New state
- Timestamp

This supports traceability instead of silently overwriting financial history.

---

# 🧮 Accounting Model

Ledgium derives financial positions from:

```text
Transactions
     +
Settlements
     +
Household membership/context
     │
     ▼
Balance calculation
     │
     ▼
Current household financial state
```

## Equal splitting

If an expense of ₹1,000 is shared equally by three people:

```text
1000 / 3 = 333.333...
```

Ledgium must reconcile the rounding so that the shares still add up to exactly ₹1,000.

For example:

```text
Person A → ₹333.34
Person B → ₹333.33
Person C → ₹333.33

Total    → ₹1,000.00
```

The system must never create or lose money because of rounding.

---

## Custom splitting

Custom shares must satisfy:

```text
sum(all shares) = transaction amount
```

Invalid distributions are rejected rather than silently corrected.

Negative shares are also invalid.

---

## Settlements

Transactions create obligations.

Settlements reduce those obligations.

For example:

```text
Transaction:
Alice paid ₹1,000
Bob owes Alice ₹250

Settlement:
Bob pays Alice ₹250

Result:
Bob owes Alice ₹0
```

Ledgium records the settlement instead of modifying the original transaction to make it appear as though the expense never existed.

---

# 🔄 Transaction Lifecycle

Financial records are treated as historical events.

A simplified transaction lifecycle is:

```text
        ┌───────────────┐
        │     ACTIVE    │
        └───────┬───────┘
                │
          ┌─────┴─────┐
          ▼           ▼
        Edit         Void
          │           │
          ▼           ▼
       ACTIVE       VOIDED
```

### Editing

Editing changes the transaction while preserving its identity and historical context.

### Voiding

Voiding is a logical operation.

The record is not physically deleted.

A voided transaction no longer contributes to current accounting, while its existence can remain part of the historical record.

---

# 🔐 Security & Authorization

Authentication answers:

> **Who are you?**

Authorization answers:

> **Are you allowed to perform this operation?**

Ledgium treats these as separate concerns.

The backend is responsible for enforcing authorization rules.

Examples include:

- Users can only access households they belong to.
- Household financial records are scoped to the appropriate household.
- Clients cannot be trusted to authorize themselves by sending an arbitrary user or household ID.
- Sensitive mutations require appropriate permissions.
- Transaction and settlement modifications are subject to domain-specific ownership/participant rules.

The frontend is therefore **not considered a security boundary**.

---

# 🧪 Testing

The backend uses automated integration tests to verify important application behavior across the API and persistence layers.

The integration suite currently verifies core finance behavior including:

### Account creation and listing

```text
Create account
      ↓
Persist account
      ↓
List accounts
      ↓
Verify returned account
```

### Transaction creation and dashboard calculation

```text
Create transaction
      ↓
Persist transaction
      ↓
Request dashboard data
      ↓
Verify transaction is reflected
```

The test suite also targets broader domain invariants such as:

- Persistence and retrieval
- Balance calculations
- Invalid input handling
- Authorization
- Split reconciliation
- Monetary precision
- Transaction voiding
- Settlement behavior
- Historical record preservation

All currently implemented backend integration tests are passing.

---

# 🛠️ Technology

The project is currently built around a modern JavaScript/TypeScript full-stack architecture.

### Backend

- Node.js
- TypeScript
- REST-style API
- MongoDB
- MongoDB ObjectIds
- Automated integration testing

### Frontend

The frontend consumes the backend API and is being integrated against the completed core finance backend.

### Data

Monetary values are represented internally using **integer paise**.

MongoDB entities use **ObjectIds**, which are serialized into string identifiers when crossing the API boundary.

---

# 📁 Project Structure

The exact structure may evolve as development continues, but the backend follows clear separation of responsibilities:

```text
Backend
├── Routes
│   └── API endpoints
│
├── Controllers / Handlers
│   └── HTTP request/response handling
│
├── Middleware
│   ├── Authentication
│   └── Authorization
│
├── Models / Schemas
│   └── Persistence definitions
│
├── Services
│   └── Domain and accounting logic
│
├── Serializers / DTOs
│   └── API response contracts
│
└── Tests
    └── Integration and domain behavior
```

The exact file and directory names should be treated as implementation details rather than part of the public architecture.

---

# 🚀 Getting Started

## Prerequisites

Before running Ledgium locally, make sure you have:

- Node.js installed
- npm installed
- MongoDB available
- Git installed

Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

Install dependencies:

```bash
npm install
```

Create the required environment configuration:

```bash
cp .env.example .env
```

Then configure the required environment variables in `.env`.

> **Note:** Never commit secrets, credentials, private keys, or production environment files to the repository.

---

## Running the Project

Start the development server using the project's configured development command.

```bash
npm run dev
```

The exact command may differ between the frontend and backend packages depending on the current repository structure.

---

# 🧪 Running Tests

Run the project's automated tests with:

```bash
npm test
```

For backend integration tests, the environment must have access to the required MongoDB instance/configuration.

The tests should be treated as part of the application's executable specification: when accounting behavior changes, the corresponding tests should change with it.

---

# ⚙️ Environment Configuration

Environment variables are used for configuration that should not be hard-coded into the application.

Typical configuration may include:

```env
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

The actual variables required by the current implementation should be taken from the repository's environment configuration/example file.

---

# 🔌 Frontend Integration

The frontend communicates with the backend through the API.

The integration should follow these principles:

### Backend is the source of truth

The frontend should not independently maintain authoritative balances.

### Authentication must be preserved

Requests must correctly include the authentication mechanism expected by the backend.

### Backend validation errors should be surfaced

Invalid financial operations should result in meaningful feedback rather than being silently ignored.

### Dashboard data should be reconciled

After mutations such as creating a transaction or settlement, the frontend should refresh or otherwise reconcile its state with backend data.

---

# 📐 Architectural Decisions

| Decision                           | Reason                                           |
| ---------------------------------- | ------------------------------------------------ |
| MongoDB ObjectIds                  | Native identity mechanism for persisted entities |
| Integer paise                      | Prevent floating-point monetary errors           |
| Derived balances                   | Avoid inconsistent duplicated financial state    |
| Logical transaction voiding        | Preserve financial history                       |
| Explicit settlements               | Represent real money transfers separately        |
| Historical participant information | Preserve the context of past transactions        |
| Backend authorization              | Prevent client-side authorization bypasses       |
| Integration testing                | Verify API behavior together with persistence    |
| Stable serialization               | Keep frontend/API contracts predictable          |

---

# 🗺️ Development Status

### Backend

**Core backend implementation: complete and integration-ready.**

The current backend milestone includes:

- Core persistence
- Account creation and listing
- Transaction creation
- Dashboard reflection of transactions
- Core accounting behavior
- Authorization and validation foundations
- Integration testing
- Passing automated backend tests

### Frontend

The next major phase is frontend integration against the completed backend APIs.

### Future development

Potential future areas include:

- More advanced financial analytics
- Recurring expenses
- Budgeting
- Improved household workflows
- Notifications
- Advanced settlement optimization
- AI-assisted financial insights

These should be considered future product directions rather than guaranteed current features.

---

# 🤝 Contributing

Ledgium is currently under active development.

When contributing:

1. Keep financial calculations deterministic.
2. Do not introduce floating-point currency calculations.
3. Preserve household-level authorization boundaries.
4. Avoid physically deleting financial history.
5. Update tests when changing domain behavior.
6. Keep API serialization consistent.
7. Update documentation when changing models, APIs, accounting rules, authorization, or tests.

For significant architectural changes, document the reasoning behind the change rather than only documenting the implementation.

---

# 📄 License

License information will be added when the project is formally licensed.

---

## Ledgium

**Shared finances, kept clear.**

A household finance system built around one principle:

> **Financial records should be understandable, accurate, and explainable.**
