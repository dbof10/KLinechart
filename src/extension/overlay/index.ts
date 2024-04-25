/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type Nullable from '../../common/Nullable'

import OverlayImp, { type OverlayTemplate, type OverlayConstructor, type OverlayInnerConstructor } from '../../component/Overlay'

import fibonacciLine from './fibonacciLine'
import horizontalSegment from './horizontalSegment'
import horizontalStraightLine from './horizontalStraightLine'
import parallelStraightLine from './parallelStraightLine'
import priceChannelLine from './priceChannelLine'
import priceLine from './priceLine'
import rayLine from './rayLine'
import segment from './segment'
import straightLine from './straightLine'
import verticalSegment from './verticalSegment'
import verticalStraightLine from './verticalStraightLine'

import simpleAnnotation from './simpleAnnotation'
import simpleTag from './simpleTag'
import rect from "./rect";
import arrow from "./arrow";
import circle from "./circle";
import parallelogram from "./parallelogram";
import triangle from "./triangle";
import fibonacciCircle from "./fibonacciCircle";
import fibonacciSegment from "./fibonacciSegment";
import fibonacciExtension from "./fibonacciExtension";
import fibonacciSpiral from "./fibonacciSpiral";
import fibonacciSpeedResistanceFan from "./fibonacciSpeedResistanceFan";
import gannBox from "./gannBox";
import abcd from "./abcd";
import xabcd from "./xabcd";
import anyWaves from "./anyWaves";
import threeWaves from "./threeWaves";
import fiveWaves from "./fiveWaves";
import eightWaves from "./eightWaves";

const overlays: Record<string, OverlayInnerConstructor> = {}

const extensions = [
  fibonacciLine, horizontalSegment, horizontalStraightLine,
  parallelStraightLine, priceChannelLine, priceLine, rayLine, segment,
  straightLine, verticalSegment, verticalStraightLine,
  simpleAnnotation, simpleTag, rect, arrow, circle, parallelogram, triangle,
  fibonacciCircle, fibonacciSegment, fibonacciExtension, fibonacciSpiral, fibonacciSpeedResistanceFan,
  gannBox, abcd, xabcd, anyWaves, threeWaves, fiveWaves, eightWaves
]

extensions.forEach((template: OverlayTemplate) => {
  overlays[template.name] = OverlayImp.extend(template)
})

function registerOverlay (template: OverlayTemplate): void {
  overlays[template.name] = OverlayImp.extend(template)
}

function getOverlayInnerClass (name: string): Nullable<OverlayInnerConstructor> {
  return overlays[name] ?? null
}

function getOverlayClass (name: string): Nullable<OverlayConstructor> {
  return overlays[name] ?? null
}

function getSupportedOverlays (): string[] {
  return Object.keys(overlays)
}

export { registerOverlay, getOverlayClass, getOverlayInnerClass, getSupportedOverlays }
