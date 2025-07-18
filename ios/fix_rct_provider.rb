#!/usr/bin/env ruby

# Script to fix RCTThirdPartyComponentsProvider.mm after pod install
# This prevents crashes due to nil NSClassFromString returns

file_path = File.join(Dir.pwd, "build/generated/ios/RCTThirdPartyComponentsProvider.mm")

if File.exist?(file_path)
  content = File.read(file_path)
  
  # Check if already fixed
  if content.include?("NSMutableDictionary")
    puts "✅ Already fixed - skipping"
    exit 0
  end
  
  # Replace the direct dictionary creation with safe nil-checked version
  if content.include?("dispatch_once(&nativeComponentsToken, ^{")
    new_content = content.gsub(
      /dispatch_once\(&nativeComponentsToken, \^\{\s*thirdPartyComponents = @\{[^}]+\};\s*\}\);/m,
      <<-OBJC
  dispatch_once(&nativeComponentsToken, ^{
    NSMutableDictionary<NSString *, Class<RCTComponentViewProtocol>> *mutableComponents = [[NSMutableDictionary alloc] init];
    
    // Safely add components with nil checks
    NSLog(@"RCTThirdPartyComponentsProvider: Building component dictionary...");
    
    Class sliderClass = NSClassFromString(@"RNCSliderComponentView");
    if (sliderClass) {
      mutableComponents[@"RNCSlider"] = sliderClass;
      NSLog(@"RCTThirdPartyComponentsProvider: Added RNCSlider");
    } else {
      NSLog(@"RCTThirdPartyComponentsProvider: RNCSliderComponentView not found");
    }
    
    Class gestureButtonClass = NSClassFromString(@"RNGestureHandlerButtonComponentView");
    if (gestureButtonClass) mutableComponents[@"RNGestureHandlerButton"] = gestureButtonClass;
    
    Class safeAreaProviderClass = NSClassFromString(@"RNCSafeAreaProviderComponentView");
    if (safeAreaProviderClass) mutableComponents[@"RNCSafeAreaProvider"] = safeAreaProviderClass;
    
    Class safeAreaViewClass = NSClassFromString(@"RNCSafeAreaViewComponentView");
    if (safeAreaViewClass) mutableComponents[@"RNCSafeAreaView"] = safeAreaViewClass;
    
    Class fullWindowOverlayClass = NSClassFromString(@"RNSFullWindowOverlay");
    if (fullWindowOverlayClass) mutableComponents[@"RNSFullWindowOverlay"] = fullWindowOverlayClass;
    
    Class modalScreenClass = NSClassFromString(@"RNSModalScreen");
    if (modalScreenClass) mutableComponents[@"RNSModalScreen"] = modalScreenClass;
    
    Class screenContainerClass = NSClassFromString(@"RNSScreenContainerView");
    if (screenContainerClass) mutableComponents[@"RNSScreenContainer"] = screenContainerClass;
    
    Class screenContentWrapperClass = NSClassFromString(@"RNSScreenContentWrapper");
    if (screenContentWrapperClass) mutableComponents[@"RNSScreenContentWrapper"] = screenContentWrapperClass;
    
    Class screenFooterClass = NSClassFromString(@"RNSScreenFooter");
    if (screenFooterClass) mutableComponents[@"RNSScreenFooter"] = screenFooterClass;
    
    Class screenClass = NSClassFromString(@"RNSScreenView");
    if (screenClass) mutableComponents[@"RNSScreen"] = screenClass;
    
    Class screenNavContainerClass = NSClassFromString(@"RNSScreenNavigationContainerView");
    if (screenNavContainerClass) mutableComponents[@"RNSScreenNavigationContainer"] = screenNavContainerClass;
    
    Class stackHeaderConfigClass = NSClassFromString(@"RNSScreenStackHeaderConfig");
    if (stackHeaderConfigClass) mutableComponents[@"RNSScreenStackHeaderConfig"] = stackHeaderConfigClass;
    
    Class stackHeaderSubviewClass = NSClassFromString(@"RNSScreenStackHeaderSubview");
    if (stackHeaderSubviewClass) mutableComponents[@"RNSScreenStackHeaderSubview"] = stackHeaderSubviewClass;
    
    Class screenStackClass = NSClassFromString(@"RNSScreenStackView");
    if (screenStackClass) mutableComponents[@"RNSScreenStack"] = screenStackClass;
    
    Class searchBarClass = NSClassFromString(@"RNSSearchBar");
    if (searchBarClass) mutableComponents[@"RNSSearchBar"] = searchBarClass;
    
    Class stackScreenClass = NSClassFromString(@"RNSStackScreenComponentView");
    if (stackScreenClass) mutableComponents[@"RNSStackScreen"] = stackScreenClass;
    
    Class stackHostClass = NSClassFromString(@"RNSScreenStackHostComponentView");
    if (stackHostClass) mutableComponents[@"RNSScreenStackHost"] = stackHostClass;
    
    Class bottomTabsScreenClass = NSClassFromString(@"RNSBottomTabsScreenComponentView");
    if (bottomTabsScreenClass) mutableComponents[@"RNSBottomTabsScreen"] = bottomTabsScreenClass;
    
    Class bottomTabsClass = NSClassFromString(@"RNSBottomTabsHostComponentView");
    if (bottomTabsClass) mutableComponents[@"RNSBottomTabs"] = bottomTabsClass;
    
    Class splitViewHostClass = NSClassFromString(@"RNSSplitViewHostComponentView");
    if (splitViewHostClass) mutableComponents[@"RNSSplitViewHost"] = splitViewHostClass;
    
    Class splitViewScreenClass = NSClassFromString(@"RNSSplitViewScreenComponentView");
    if (splitViewScreenClass) mutableComponents[@"RNSSplitViewScreen"] = splitViewScreenClass;
    
    thirdPartyComponents = [mutableComponents copy];
  });
OBJC
    )
    
    File.write(file_path, new_content)
    puts "✅ Fixed RCTThirdPartyComponentsProvider.mm with nil checks"
  else
    puts "⚠️  RCTThirdPartyComponentsProvider.mm format not recognized"
  end
else
  puts "❌ RCTThirdPartyComponentsProvider.mm not found at #{file_path}"
end