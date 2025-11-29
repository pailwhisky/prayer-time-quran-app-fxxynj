
// iOS-specific implementation using SF Symbols
import React from 'react';
import { SymbolView, SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

export type IconSymbolName = SymbolViewProps['name'];

/**
 * An icon component that uses native SFSymbols on iOS.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
