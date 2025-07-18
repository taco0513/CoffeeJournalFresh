#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <UIKit/UIKit.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"CoffeeJournalFresh";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Set dark keyboard appearance after super initialization
  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];
  
  // Set appearance on main thread
  if ([NSThread isMainThread]) {
    [[UITextField appearance] setKeyboardAppearance:UIKeyboardAppearanceDark];
    [[UITextView appearance] setKeyboardAppearance:UIKeyboardAppearanceDark];
  }
  
  return result;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end