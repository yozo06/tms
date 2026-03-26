const fs = require('fs');
const path = require('path');

const moves = [
    ['src/api/client.ts', 'src/core/api/client.ts'],
    ['src/api/auth.ts', 'src/core/api/auth.ts'],
    ['src/api/trees.ts', 'src/modules/arbor/api/trees.ts'],
    ['src/api/map.ts', 'src/modules/arbor/api/map.ts'],
    ['src/api/species.ts', 'src/modules/arbor/api/species.ts'],
    ['src/api/dashboard.ts', 'src/modules/arbor/api/dashboard.ts'],
    ['src/api/users.ts', 'src/settings/api/users.ts'],
    ['src/components/Layout.tsx', 'src/core/components/Layout.tsx'],
    ['src/components/BottomNav.tsx', 'src/core/components/BottomNav.tsx'],
    ['src/components/Spinner.tsx', 'src/core/components/Spinner.tsx'],
    ['src/components/HealthBadge.tsx', 'src/core/components/HealthBadge.tsx'],
    ['src/components/HealthBadge.test.tsx', 'src/core/components/HealthBadge.test.tsx'],
    ['src/components/ProjectSwitcher.tsx', 'src/core/components/ProjectSwitcher.tsx'],
    ['src/components/TreeCard.tsx', 'src/modules/arbor/components/TreeCard.tsx'],
    ['src/components/ActionBadge.tsx', 'src/modules/arbor/components/ActionBadge.tsx'],
    ['src/components/MapCanvas.tsx', 'src/modules/arbor/components/MapCanvas.tsx'],
    ['src/components/MapPicker.tsx', 'src/modules/arbor/components/MapPicker.tsx'],
    ['src/components/SpeciesModal.tsx', 'src/modules/arbor/components/SpeciesModal.tsx'],
    ['src/components/ZoneModal.tsx', 'src/modules/arbor/components/ZoneModal.tsx'],
    ['src/pages/Dashboard.tsx', 'src/modules/arbor/pages/Dashboard.tsx'],
    ['src/pages/FieldHome.tsx', 'src/modules/arbor/pages/FieldHome.tsx'],
    ['src/pages/TreeList.tsx', 'src/modules/arbor/pages/TreeList.tsx'],
    ['src/pages/TreeDetail.tsx', 'src/modules/arbor/pages/TreeDetail.tsx'],
    ['src/pages/TreeAdd.tsx', 'src/modules/arbor/pages/TreeAdd.tsx'],
    ['src/pages/TreeEdit.tsx', 'src/modules/arbor/pages/TreeEdit.tsx'],
    ['src/pages/HealthLog.tsx', 'src/modules/arbor/pages/HealthLog.tsx'],
    ['src/pages/ActivityLog.tsx', 'src/modules/arbor/pages/ActivityLog.tsx'],
    ['src/pages/MapView.tsx', 'src/modules/arbor/pages/MapView.tsx'],
    ['src/pages/PublicTree.tsx', 'src/modules/arbor/pages/PublicTree.tsx'],
    ['src/pages/Employees.tsx', 'src/settings/pages/Employees.tsx'],
    ['src/pages/Profile.tsx', 'src/settings/pages/Profile.tsx'],
    ['src/pages/About.tsx', 'src/settings/pages/About.tsx'],
    ['src/pages/Login.tsx', 'src/core/pages/Login.tsx'],
    ['src/pages/Signup.tsx', 'src/core/pages/Signup.tsx'],
    ['src/store/auth.store.ts', 'src/core/store/auth.store.ts'],
    ['src/store/auth.store.test.ts', 'src/core/store/auth.store.test.ts'],
];

for (const [src, dest] of moves) {
    const fullSrc = path.join(__dirname, 'frontend', src);
    const fullDest = path.join(__dirname, 'frontend', dest);

    if (fs.existsSync(fullSrc)) {
        fs.mkdirSync(path.dirname(fullDest), { recursive: true });
        // If destination exists, we overwrite it (renameSync overwrites by default)
        fs.renameSync(fullSrc, fullDest);
        console.log(`Moved ${src} to ${dest}`);
    } else {
        if (fs.existsSync(fullDest)) {
            console.log(`Already moved: ${dest}`);
        } else {
            console.log(`NOT FOUND: ${src}`);
        }
    }
}
