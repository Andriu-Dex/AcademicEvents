Running "expo doctor"
Running 18 checks on your project...
17/18 checks passed. 1 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.
✖ Check that packages match versions required by installed Expo SDK

🔧 Patch version mismatches
package             expected  found    
expo                ~54.0.35  54.0.33  
expo-file-system    ~19.0.23  19.0.22  
expo-font           ~14.0.12  14.0.11  
expo-linking        ~8.0.12   8.0.11   
expo-notifications  ~0.32.17  0.32.16  
expo-router         ~6.0.24   6.0.23   

Changelogs:
- expo-file-system → https://github.com/expo/expo/blob/sdk-54/packages/expo-file-system/CHANGELOG.md
- expo-font → https://github.com/expo/expo/blob/sdk-54/packages/expo-font/CHANGELOG.md
- expo-linking → https://github.com/expo/expo/blob/sdk-54/packages/expo-linking/CHANGELOG.md
- expo-notifications → https://github.com/expo/expo/blob/sdk-54/packages/expo-notifications/CHANGELOG.md
- expo-router → https://github.com/expo/expo/blob/sdk-54/packages/expo-router/CHANGELOG.md

6 packages out of date.
Advice:
Use 'npx expo install --check' to review and upgrade your dependencies.
To ignore specific packages, add them to "expo.install.exclude" in package.json. Learn more: https://expo.fyi/dependency-validation
1 check failed, indicating possible issues with the project.
Command "expo doctor" failed.
npx -y expo-doctor exited with non-zero code: 1