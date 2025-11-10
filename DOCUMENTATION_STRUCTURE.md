# Documentation Structure Guide

This document explains the organization of documentation files in the NRL Fan Hub project.

## Primary Documentation (For Portfolio/Resume Viewers)

### Main Entry Point

- **[README.md](README.md)** - Portfolio-focused overview showcasing engineering skills
  - How to Build section
  - Technical Design & Architecture
  - System Architecture & Design Flow
  - Performance metrics and achievements
  - DevOps & CI/CD pipeline

### Technical Deep Dives

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture with detailed diagrams
- **[API.md](API.md)** - Full API reference with 15+ endpoints documented
- **[PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md)** - Detailed performance analysis and benchmarks
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

### Setup Guides

- **[QUICK_START.md](QUICK_START.md)** - 5-minute quick start guide
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed step-by-step setup instructions
- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Auth0 configuration guide
- **[SETUP_SCRIPTS.md](SETUP_SCRIPTS.md)** - Automated setup script documentation

---

## Supporting Documentation (Reference/Internal)

### Project Planning (Archive)

These files were used during development and contain project management artifacts:

- **START_HERE.md** - Original entry point (now consolidated into README.md)
- **PROJECT_BREAKDOWN.md** - Sprint planning and story breakdown
- **nrl-fan-hub-stories.md** - Detailed user stories and tasks
- **STORY\_\*.md** - Individual story completion reports
  - STORY_3_LIVE_MATCH_DISPLAY.md
  - STORY_8_TESTING_SETUP.md
  - STORY_10_COMPLETION.md
- **DEMO_VIDEO_SCRIPT.md** - Internal demo recording guide

**Recommendation:** These files can be moved to `/docs/archive/` to keep the root directory clean while preserving project history.

---

## Documentation for Different Audiences

### For Recruiters / Hiring Managers

**Start here:** [README.md](README.md)

- High-level overview with impressive metrics
- Key engineering decisions explained
- System architecture visualizations
- DevOps and CI/CD highlights

**Then explore:**

- [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) - See detailed metrics
- [ARCHITECTURE.md](ARCHITECTURE.md) - Understand system design

### For Developers / Technical Reviewers

**Start here:** [QUICK_START.md](QUICK_START.md) or [README.md](README.md#how-to-build)

- Get the app running in 5 minutes
- Understand the tech stack

**Then explore:**

- [API.md](API.md) - API endpoints and examples
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup with troubleshooting

### For DevOps / Operations

**Start here:** [DEPLOYMENT.md](DEPLOYMENT.md)

- Production deployment process
- Environment configuration
- Rollback procedures

**Then explore:**

- [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) - Performance baselines
- [ARCHITECTURE.md](ARCHITECTURE.md) - Infrastructure architecture

---

## File Organization Recommendations

### Current Root Directory

```
league-fan-hub/
├── README.md                    ⭐ Main entry point (portfolio-focused)
├── ARCHITECTURE.md              📐 System architecture
├── API.md                       📡 API reference
├── PERFORMANCE_REPORT.md        📊 Performance metrics
├── DEPLOYMENT.md                🚀 Deployment guide
├── QUICK_START.md               ⚡ Quick setup
├── SETUP_GUIDE.md               📖 Detailed setup
├── AUTHENTICATION.md            🔐 Auth0 setup
├── SETUP_SCRIPTS.md             🛠️ Script documentation
└── docs/
    ├── archive/                 📦 Archived project files
    │   ├── START_HERE.md
    │   ├── PROJECT_BREAKDOWN.md
    │   ├── nrl-fan-hub-stories.md
    │   ├── STORY_*.md
    │   └── DEMO_VIDEO_SCRIPT.md
    └── performance-optimizations.md
```

### Cleanup Commands (Optional)

To organize files into archive folder:

```bash
# Create archive directory
mkdir -p docs/archive

# Move planning/internal docs to archive
mv START_HERE.md docs/archive/
mv PROJECT_BREAKDOWN.md docs/archive/
mv STORY_*.md docs/archive/
mv DEMO_VIDEO_SCRIPT.md docs/archive/
```

---

## Documentation Maintenance

### When to Update

| Document              | Update Trigger                                                    |
| --------------------- | ----------------------------------------------------------------- |
| README.md             | Major feature releases, architecture changes, new metrics         |
| ARCHITECTURE.md       | System design changes, new components, infrastructure updates     |
| API.md                | New endpoints, changed parameters, updated examples               |
| PERFORMANCE_REPORT.md | Performance improvements, new benchmarks, optimization work       |
| DEPLOYMENT.md         | Infrastructure changes, new deployment steps, rollback procedures |

### Style Guidelines

1. **README.md**: Portfolio-focused, approachable tone, emphasize achievements
2. **Technical Docs**: Professional, detailed, includes code examples
3. **Guides**: Step-by-step, clear instructions, troubleshooting sections
4. **Reports**: Data-driven, tables and charts, comparison metrics

---

## Quick Links

### Essential Reading

- 🎯 [Portfolio Overview](README.md)
- ⚡ [Quick Start](QUICK_START.md)
- 📐 [Architecture](ARCHITECTURE.md)
- 📊 [Performance Report](PERFORMANCE_REPORT.md)

### Setup & Configuration

- 🔐 [Auth0 Setup](AUTHENTICATION.md)
- 📖 [Detailed Setup Guide](SETUP_GUIDE.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)

### Technical Reference

- 📡 [API Documentation](API.md)
- 🏗️ [System Architecture](ARCHITECTURE.md)
- ⚙️ [Performance Optimizations](docs/performance-optimizations.md)

---

**Last Updated:** November 10, 2025
**Maintained By:** Stephan Morris
