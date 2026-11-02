# Troubleshooting Login & Signup Pages

## Issue: Page showing "500 Something hit a speed bump"

This error means there's a runtime JavaScript error. Let's fix it step by step.

## Quick Fixes to Try:

### 1. Clear Browser Cache
- Press `Ctrl + Shift + R` (hard refresh)
- Or `Ctrl + F5`
- Or clear cache in browser settings

### 2. Check Dev Server
- Make sure dev server is running: `npm run dev`
- Server should be on `http://localhost:5174` (or 5173)
- Check for any errors in terminal

### 3. Check Browser Console
- Press `F12` to open DevTools
- Go to Console tab
- Look for red error messages
- Share the error message if you see one

### 4. Common Issues:

#### Issue: "Cannot read property 'map' of undefined"
**Solution**: The mediaList array might not be imported correctly

#### Issue: "motion is not defined"
**Solution**: Framer Motion import issue

#### Issue: "useToast is not a function"
**Solution**: Toast component import issue

## If Still Not Working:

### Option A: Restart Dev Server
```bash
# Stop the server (Ctrl + C in terminal)
npm run dev
```

### Option B: Clear node_modules
```bash
rm -rf node_modules
npm install
npm run dev
```

### Option C: Check specific file
Open `src/pages/auth/Login.jsx` and check:
1. All imports at the top are correct
2. No syntax errors (missing braces, parentheses)
3. All components are properly closed

## What to Check Next:

1. **Open your browser to**: `http://localhost:5174/login`
2. **Press F12** to open DevTools
3. **Check Console tab** for errors
4. **Check Network tab** for failed requests
5. **Share the error message** you see

## Expected Behavior:

When working correctly, you should see:
- ✅ Beautiful animated login form
- ✅ Floating particles in background
- ✅ Smooth animations on hover
- ✅ Role selector buttons (Patient/Doctor/Admin)
- ✅ Animated form fields
- ✅ Premium gradient button

## Dev Server Commands:

Start server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Next Steps:

Once you share the specific error from browser console, I can provide the exact fix!
