# Frontend Architecture Blueprint: IGCIM Refactor

This document serves as the final structural guide for the IGCIM frontend rebuild. All legacy commission logic and tier systems are replaced by a **Points-Based Binary referral system**.

---

## SECTION 1: STUDENT DASHBOARD

### 1. Unified Sidebar Navigation
The menu is simplified to focus on financial growth and network health.
- **🏠 Dashboard**: Main overview and quick statistics.
- **🕸️ My Network**: Binary tree visibility and leg stats.
- **💰 Earnings**: Detailed breakdown of points and overrides.
- **🏧 Withdraw**: Funds management and eligibility status.
- **👤 Profile**: Personal info and security settings.

### 2. Dashboard Overview (Main Widgets)
The primary view uses a high-impact grid to show the student's current standing.
- **Total Points (IC)**: Cumulative IC credits earned (1 IC = ₹1).
- **Total Earnings (₹)**: Lifetime earnings converted to Rupees.
- **Today Earnings (₹)**: Earnings generated in the current IST day (00:00 - 23:59).
- **Withdrawable Balance (₹)**: `Wallet Balance - Pending Withdrawals`.
- **Branch Stats**:
  - `Left Count`: Total approved admissions in the left subtree.
  - `Right Count`: Total approved admissions in the right subtree.
  - `Directs`: Count of direct referrals (Progress bar: X / 6).

### 3. My Network (Binary Ecosystem)
Focuses on branch balancing which is critical for withdrawal eligibility.
- **Binary Statistics Card**: 
  - Subtree admission counts (Left vs. Right).
  - Direct referral list with placement position.
- **Tree Visualization**: 
  - A clean, interactive SVG/Canvas tree showing the student + 2 levels of sub-nodes.
  - Indicators for 'Pending Placement' nodes.

### 4. Earnings Breakdown
A transparent view of how money is made.
- **Direct Earnings**: Rewards from direct referrals.
- **Level 1 Overrides**: Indirect rewards from Level 1 team performance.
- **Level 2 Overrides**: Indirect rewards from Level 2 team performance.
- **Ledger Table**: Immutable list of points transactions with date and source admission.

### 5. Withdrawal Center
Automated rules enforcement to reduce support tickets.
- **Balance Display**: Current ₹ available for withdrawal.
- **Eligibility Checklist**: 
  - [ ] Left Branch Active (Min 1 Admission)
  - [ ] Right Branch Active (Min 1 Admission)
  - [ ] Minimum Threshold (₹300 reached)
- **Withdrawal History**: Table showing `Amount`, `Status` (Pending/Approved/Paid), and `Payout Date`.

### 6. Performance Analytics
- **Earnings Growth**: Line chart showing Total Earnings (₹) over 30 days.
- **Admissions Volume**: Bar chart showing daily team growth.

---

## SECTION 2: ADMIN DASHBOARD

### 1. Sidebar Navigation
- **📊 Overview**: Macro system performance.
- **👥 Users**: Student management and tree mapping.
- **📝 Admissions**: New enrollment processing.
- **🌳 Tree Monitor**: System health and placement safety.
- **💸 Withdrawals**: Payout approval queue.
- **⚙️ Settings**: Core mission/financial parameters.
- **📈 Reports**: Exportable data snapshots.

### 2. System Overview
- **Total Users**: Full registered count.
- **Active Admissions**: Total approved students in the tree.
- **Points Economy**: Total IC issued vs. Total IC pending.
- **Payout Liquidity**: Total ₹ paid out to date.

### 3. Tree Monitor (Safety Hub)
- **Placement Queue**: List of users with `placement_status = 'pending'`.
- **Failure Log**: Users who failed auto-placement (Manual intervention required).
- **Health Check**: Indicator of tree symmetry and orphan nodes.

### 4. Global Management
- **Users**: Search by System ID; view full referral path; manually adjust status.
- **Admissions**: 
  - **Approval Queue**: Review payment receipts and KYC.
  - **Fraud Shield**: Flags for duplicate payment references or contact details.
- **Withdrawals**: 
  - **Approval Flow**: Verify bank/UPI details; mark as 'Paid' with reference number.

### 5. Financial & Rules Control (Settings)
Centralized control for system variables.
- **IC Point Value**: Fixed ₹ conversion (Standard: 1).
- **Override Percentages**: Configurable L1 and L2 rates.
- **Override Cap**: Total max override per admission (Standard: ₹2).
- **Withdrawal Minimum**: Lowest ₹ allowed per request (Standard: ₹300).

---

## SECTION 3: CLEANUP & AUDIT RULES

### ❌ REMOVE (DEPRECATE)
1. **Tier Systems**: Remove all Silver/Gold/Platinum labels and logic.
2. **Old Commission UI**: Remove tables referencing 10%/20% tiers or legacy commission math.
3. **Redundant Charts**: Remove legacy charts that calculate "estimated" revenue.
4. **Calculations on Frontend**: All math must be derived from the `dashboardData` backend API.

### ✅ KEEP (RETAIN)
1. **Points Wallet**: Source of truth is `points_wallet` table.
2. **Binary Logic**: All stats derived from subtree counts.
3. **Clean Aesthetics**: Dark mode, high-contrast text, fluid layouts.

---

## SECTION 4: UX & PERFORMANCE STANDARDS

- **Mobile First**: All dashboards must be fully functional on mobile devices (320px+).
- **Zero Calculation**: UI only displays values; no business logic in JSX.
- **IST Consistency**: Use server-provided IST dates for all "Today" and "History" views.
- **Optimistic State**: Use instant UI feedback for profile updates or claim buttons.
