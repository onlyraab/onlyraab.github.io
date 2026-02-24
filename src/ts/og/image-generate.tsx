// og-component.tsx

const fullImageWidth = 1200;
const fullImageHeight = 630;
const squareImageWidth = fullImageHeight;
const squareImageHeight = fullImageHeight;
const squareImageLeft = (fullImageWidth - squareImageWidth) / 2;
const squareImageRight = squareImageLeft + squareImageWidth;
const paddingImageWidth = (fullImageWidth - squareImageWidth) / 2;
const yellow = "#ff0";
const pink = "#f0f";
const black = "#000";
const backgroundColors = [yellow, pink] as const;
const onBackgroundColors = [black, black] as const;
const colorCount = backgroundColors.length;

const ImageChar = ({ char, colorIndex }: { char: string, colorIndex: number }) => {
  const index = colorIndex % colorCount;
  const color = onBackgroundColors[index];
  const backgroundColor = backgroundColors[index];
  if (char === " ") {
    char = "\u00A0";
  }
  return (<span style={{ color, backgroundColor, minWidth: "2px" }}>{char}</span>);
}

const ImageBg = ({minWidth, maxWidth, minHeight, maxHeight, color, count}: {minWidth: number, maxWidth: number, minHeight: number, maxHeight: number, color: string, count: number}) => {
  const elements = [];
  for (let i = 0; i < count; i++) {
    const width = Math.floor(Math.random() * (maxWidth - minWidth)) + minWidth;
    const height = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    const left = Math.floor(Math.random() * (fullImageWidth - width));
    const top = Math.floor(Math.random() * (fullImageHeight - height));
    elements.push(
      <div key={i} style={{display: "flex", position: "absolute", left, top, width, height, backgroundColor: color }} />
    );
  }

  return (
    <div
      style={{
        width: `${fullImageWidth}px`,
        height: `${fullImageHeight}px`,
        position: "absolute",
        display: "flex",
      }}
    >
      {elements}
    </div>
  );
}

const gap = 18;
const minSize = gap;
const ImageElements = ( {left, top, width, height, colorIndex}: {left: number, top: number, width: number, height: number, colorIndex: number}) => {

  const isPortrait = height > width;
  if ((!isPortrait && width < minSize) || (isPortrait && height < minSize)) {
    console.log(width, height, colorIndex, isPortrait);
    return null;
  }

  const childWidth = isPortrait ? width - gap * 2 : (width - gap * 3) / 2;
  const childHeight = isPortrait ? (height - gap * 3) / 2 : height - gap * 2;
  const firstChildLeft = gap;
  const firstChildTop = gap;
  const secondChildLeft = isPortrait ? gap : childWidth + gap * 2;
  const secondChildTop = isPortrait ? childHeight + gap * 2 : gap;

  return (<div
    style={{
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
      position: "absolute",
      backgroundColor: backgroundColors[colorIndex % colorCount],
      flexDirection: isPortrait ? "column" : "row",
      display: "flex",
    }}
  >
    <ImageElements left={firstChildLeft} top={firstChildTop} width={childWidth} height={childHeight} colorIndex={colorIndex + 1} />
    <ImageElements left={secondChildLeft} top={secondChildTop} width={childWidth} height={childHeight} colorIndex={colorIndex + 1} />
  </div>);
}

const ImageBgs = () => {
  const elements = [];
  const layers = 4;

  const maxWidthFactor = 0.8;
  const minWidthFactor = 0.8;
  const maxHeightFactor = 0.8;
  const minHeightFactor = 0.8;
  const countFactor = 2;

  let maxWidth = fullImageWidth;
  let minWidth = maxWidth * .8;
  let maxHeight = fullImageHeight;
  let minHeight = maxHeight * .8;
  let count = 2;

  for (let i = 0; i < layers; i++) {
    maxWidth *= maxWidthFactor;
    minWidth = maxWidth * minWidthFactor;
    maxHeight *= maxHeightFactor;
    minHeight = maxHeight * minHeightFactor;
    count *= countFactor;
    const color = backgroundColors[i % colorCount];
    elements.push(<ImageBg key={i} minWidth={minWidth} maxWidth={maxWidth} minHeight={minHeight} maxHeight={maxHeight} color={color} count={count} />);
  }

  return (
    <div
      style={{
        width: `${fullImageWidth}px`,
        height: `${fullImageHeight}px`,
        position: "absolute",
        display: "flex",
      }}
    >
      {elements}
    </div>
  );
}

const ImageLines = () => {
  const lineWidth = fullImageWidth * 2;
  const lineHeight = 20;
  const lineCount = Math.ceil(fullImageHeight / lineHeight) + 10;
  const elements = [];
  for (let i = 0; i < lineCount; i++) {
    const top = i * lineHeight;
    elements.push(
      <div key={i} style={{position: "absolute", left: 0, top, width: lineWidth, height: lineHeight, backgroundColor: backgroundColors[i % colorCount]}} />
    );
  }

  return (<div
    style={{
      width: `${fullImageWidth}px`,
      height: `${fullImageHeight}px`,
      position: "absolute",
      display: "flex",
    }}
    >
    <div
      style={{
        width: `${fullImageWidth}px`,
        left: `-${Math.floor(fullImageWidth / 2)}px`,
        height: `${fullImageHeight}px`,
        transform: "rotate(-10deg)",
        position: "absolute",
        display: "flex",
      }}
    >
      {elements}
    </div>
  </div>);
}

export const ImageOg = ({ title }: { title: string }) => {
  return (
    <div
      style={{
        width: `${fullImageWidth}px`,
        height: `${fullImageHeight}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        color: "white",
        fontSize: 64,
      }}
    >
      {/*<ImageElements left={0} top={0} width={paddingImageWidth} height={fullImageHeight} colorIndex={0} />*/}
      {/*<ImageElements left={squareImageRight} top={0} width={paddingImageWidth} height={fullImageHeight} colorIndex={0} />*/}
      {/*<ImageElements left={squareImageLeft - gap} top={0} width={squareImageWidth + gap * 2} height={fullImageHeight} colorIndex={0} />*/}
      <ImageLines/>
      {title.split("").map((char, index) => (
        <ImageChar key={index} char={char} colorIndex={index} />
      ))}
    </div>
  );
};

import { ImageResponse } from "@vercel/og";
import { writeFile } from "fs/promises";
import { mkdir } from "node:fs/promises";

await mkdir("docs/og", { recursive: true });

async function generate() {
  const image = new ImageResponse(
    <ImageOg title="Hello World" />,
    {
      width: 1200,
      height: 630,
    }
  );

  const buffer = Buffer.from(await image.arrayBuffer());
  await writeFile("docs/og/og-image.png", buffer);
}

generate();