# Project: Ringo Japanese Learning App

## Health-Driven Development
To minimize token usage and maximize safety, follow this surgical workflow:

### 1. Data Schema Changes
- **Tool:** `.health.super.md` (e.g., `src/db/schemas/Vocabulary.health.super.md`)
- **Workflow:** Read for Data/Schema ripple effects.

### 2. Business Logic Changes
- **Tool:** `.usage.super.md` (e.g., `src/hooks/useVocabulary.usage.super.md`)
- **Workflow:** Read to see which screens consume a specific Hook.

### 3. Repository API Reference
- **Tool:** `.api.super.md` (e.g., `src/db/repositories/VocabularyRepository.api.super.md`)
- **Workflow:** Read to see available DB methods without opening the full repo file.

### 4. Component Props & UI Surface
- **Tool:** `.props.super.md` (e.g., `src/components/DictionaryPopup.props.super.md`)
- **Workflow:** Read to check the interface and see where a component is rendered.

### 5. Webview Communication
- **Tool:** `.bridge.super.md` (e.g., `src/webview/script.bridge.super.md`)
- **Workflow:** Read to map the postMessage/onMessage protocol between JS and the Webview.

### 6. Navigation Parameters
- **Tool:** `.params.super.md` (e.g., `src/navigation/AppNavigator.params.super.md`)
- **Workflow:** Read to see exactly what parameters (id, term, url) each screen expects before performing a navigation call.

### 7. Database Integrity
- **Tool:** `src/db/DatabaseIntegrity.health.super.md`
- **Workflow:** Read to verify that all SQL operations are encapsulated within Repository classes.

### 8. Theme Consistency
- **Tool:** `src/Theme.health.super.md`
- **Workflow:** Read to audit hardcoded hex colors and inline styles; encourages migration to `theme.ts`.

### 9. Project Maintenance (Dead Code)
- **Tool:** `src/Project.health.super.md`
- **Workflow:** Read to identify orphaned files that are no longer being imported.

## Core Architecture
- **Framework:** React Native (Android focus).
- **Data Layer:** `op-sqlite` using a Repository pattern (`src/db/repositories`).
- **Super Power Monitoring:**
    - **Health Files:** Track Type/Schema ripples.
    - **Usage Files:** Track Hook/Logic consumption.
- **Domain Logic:** Primarily encapsulated in custom hooks (`src/hooks`).
- **Japanese Engine:** Custom segmentation and deinflection in `src/ja-dic-engine`.

## Development Guidelines
1. **Database:** Use `Repository` classes for all data access. Avoid direct SQL in components.
2. **SRS:** Follow the SM-2 logic in `src/utils/srsLogic.ts`.
3. **Android Focus:** Prioritize Android performance and UX.


PLEASE IF A .super.md file of that file is present read it first, they were written to help you dont ingnore them they change everytime you read them