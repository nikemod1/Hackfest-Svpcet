package com.apsas.sos;

import android.content.Context;
import android.hardware.SensorManager;
import android.view.KeyEvent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PowerButtonModule extends ReactContextBaseJavaModule {
  private static final String EVENT_NAME = "PowerButtonPressed";
  private int powerButtonPressCount = 0;
  private long lastPowerButtonPressTime = 0;
  private static final long POWER_BUTTON_TIMEOUT = 1500;

  public PowerButtonModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "PowerButtonModule";
  }

  @ReactMethod
  public void setupPowerButtonListener() {
    // This will be called from React to set up the listener
    // Note: Power button interception is limited in Android
    // as a security measure. This module attempts to detect
    // volume button presses as a workaround.
  }

  public void handleKeyEvent(int keyCode, long eventTime) {
    // Detect power button (KEYCODE_POWER = 26)
    if (keyCode == KeyEvent.KEYCODE_POWER) {
      long now = System.currentTimeMillis();
      
      if (now - lastPowerButtonPressTime > POWER_BUTTON_TIMEOUT) {
        powerButtonPressCount = 1;
      } else {
        powerButtonPressCount++;
      }
      
      lastPowerButtonPressTime = now;

      WritableMap params = Arguments.createMap();
      params.putInt("pressCount", powerButtonPressCount);
      params.putBoolean("triggeredSOS", powerButtonPressCount >= 3);

      sendEvent(params);

      if (powerButtonPressCount >= 3) {
        powerButtonPressCount = 0;
      }
    }
  }

  private void sendEvent(WritableMap params) {
    getReactApplicationContext()
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(EVENT_NAME, params);
  }

  @ReactMethod
  public void resetPressCount() {
    powerButtonPressCount = 0;
  }
}
