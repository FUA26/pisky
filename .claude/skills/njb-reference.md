# NJB Reference Skill

Check Next-js-Boilerplate (NJB) for relevant implementations and adapt them to pisky requirements.

## When to Use

Use this skill BEFORE implementing any feature or configuration:
- When starting a new phase
- When implementing a feature that exists in NJB
- When setting up tooling that NJB also uses
- When unsure about implementation approach

## Workflow

### Step 1: Understand Current Task

First, clearly define what needs to be implemented:
- What feature/functionality?
- What are the requirements from the spec?
- What are the key differences from NJB?

### Step 2: Search NJB for Relevant Code

Search NJB for similar functionality:

```bash
# Search for keywords in NJB source
grep -r "keyword" /home/acn/acn/Next-js-Boilerplate/src/

# Check package.json for dependencies
cat /home/acn/acn/Next-js-Boilerplate/package.json | grep "package-name"

# Find relevant config files
ls /home/acn/acn/Next-js-Boilerplate/ | grep -i "tool-name"
```

### Step 3: Extract and Analyze

For each relevant finding:
1. Read the implementation in NJB
2. Identify the core patterns used
3. Note dependencies and their versions
4. Understand the reasoning behind the approach

### Step 4: Adapt to Pisky

Apply these transformations:
- Replace NJB-specific tools with pisky equivalents
- Restructure to feature-based architecture
- Apply pisky configuration standards
- Simplify where appropriate (pragmatic vs comprehensive)

### Step 5: Document Differences

In tutorial documentation, note:
- What was referenced from NJB
- What was changed and why
- Any alternative approaches considered

## Key Differences Reference

Always remember these differences when referencing NJB:

| Category | NJB | Pisky |
|----------|-----|-------|
| Linter | Oxlint | ESLint |
| Formatter | Oxfmt | Prettier |
| Auth | Clerk | NextAuth.js |
| Structure | Standard | Feature-based |
| UI | Custom | Shadcn UI |
| Production DB | Neon | Provider-agnostic |
| CI Review | CodeRabbit | None |

## What to Extract

✅ Extract and adapt:
- Configuration patterns (tool-agnostic)
- Testing approaches (simplified)
- Error handling patterns
- TypeScript patterns
- Integration setups (Sentry, LogTape, etc.)

❌ Do NOT copy:
- Clerk-specific code
- Neon-specific code
- Oxlint/Oxfmt configs
- Structure that doesn't match
- CodeRabbit configurations

## Example Usage

**User:** "I need to setup Sentry integration"

**Assistant using this skill:**
1. Check NJB for Sentry setup
2. Find: `/home/acn/acn/Next-js-Boilerplate/src/libs/Sentry.ts`
3. Analyze: Uses Sentry SDK, has Spotlight for dev, DSN from env
4. Adapt: Same approach works for pisky, no auth-specific code
5. Implement: Create similar setup in `config/sentry.ts`

## Notes

- NJB is at `/home/acn/acn/Next-js-Boilerplate`
- Always verify NJB version is current
- Some patterns may be outdated compared to latest best practices
- When in doubt, prefer official documentation over NJB implementation
