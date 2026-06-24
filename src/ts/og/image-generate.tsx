

import { ImageResponse } from "@vercel/og";
import { writeFile } from "fs/promises";
import { DateEntry } from "../types/DateEntry";

const fullImageWidth = 1200;
const fullImageHeight = 630;
const squareImageWidth = fullImageHeight;
const squareImageHeight = fullImageHeight;
const yellow = "#ff0";
const pink = "#f0f";
const backgroundColors = [yellow, pink] as const;
const colorCount = backgroundColors.length;



const gap = 18;
const minSize = gap;
const ImageElements = ( {left, top, width, height, colorIndex}: {left: number, top: number, width: number, height: number, colorIndex: number}) => {

  const isPortrait = height > width;
  if ((!isPortrait && width < minSize) || (isPortrait && height < minSize)) {
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

const renderSentence = (sentence: string, color: string, backgroundColor: string) => {
  const elements = [];

  const words = sentence.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.trim() === "") {
      continue;
    }

    elements.push(
      <span key={i} style={{color, backgroundColor}}>{word}</span>
    );
    if ( i < words.length - 1) {
      elements.push(
        <span key={i}>{"\u00A0"}</span>
      );
    }
  }

  return <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>{elements}</div>;
}

const ImageText = ({ title, dateHuman, keywords }: { title: string, dateHuman: string, keywords: string[] }) => {
  const keywordsText = keywords.join(", ");

  const dateFontSize = 48

  let titleFontSize = 56;
  if (title.length > 40) {
    titleFontSize = 48;
  }

  let keywordsFontSize = 32;
  if (keywordsText.length > 100) {
    keywordsFontSize = 30;
  }
  if (keywordsText.length > 150) {
    keywordsFontSize = 28;
  }
  if (keywordsText.length > 200) {
    keywordsFontSize = 26;
  }
  if (keywordsText.length > 250) {
    keywordsFontSize = 24;
  }
  if (keywordsText.length > 300) {
    keywordsFontSize = 22;
  }
  if (keywordsText.length > 350) {
    keywordsFontSize = 20;
  }
  if (keywordsText.length > 400) {
    keywordsFontSize = 18;
  }
  if (keywordsText.length > 450) {
    keywordsFontSize = 16;
  }
  if (keywordsText.length > 500) {
    keywordsFontSize = 14;
  }


  return (
  <div
    style={{
      width: `${squareImageWidth}px`,
      height: `${squareImageHeight}px`,
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
    >
    
    <div
      style={{
        display: "flex",
        fontSize: dateFontSize,
        fontWeight: "bold",
        justifyContent: "flex-end",
      }}
      >
      {renderSentence(dateHuman, pink, yellow)}
    </div>
    
    <div
      style={{
        paddingTop: `${gap}px`,
        display: "flex",
        color: yellow,
        textAlign: "center",
        fontSize: titleFontSize,
        fontWeight: "bold",
      }}
      >
      {renderSentence(title.toUpperCase(), yellow, pink)}
    </div>

    <div
      style={{
        paddingTop: `${gap}px`,
        display: "flex",
        color: "black",
        fontSize: keywordsFontSize,
        fontWeight: "bold",}}
      >
      {renderSentence(keywordsText, pink, yellow)}
    </div>

  </div>);
}

export const ImageOg = ({ title, dateHuman, keywords }: { title: string, dateHuman: string, keywords: string[] }) => {
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
        flexDirection: "column",
      }}
    >
      <ImageLines/>
      <ImageText title={title} dateHuman={dateHuman} keywords={keywords} />
    </div>
  );
};

export const generateDateSocialImage = async (dateEntry: DateEntry) => {
  const imagePath = "docs/" + dateEntry.ogImageUrl;

  const image = new ImageResponse(
    <ImageOg title={dateEntry.title} dateHuman={dateEntry.dateHuman} keywords={dateEntry.keywords} />,
    {
      width: 1200,
      height: 630,
    }
  );

  const buffer = Buffer.from(await image.arrayBuffer());
  await writeFile(imagePath, buffer);
}

export const generateAllDateSocialImages = async (dateEntries: DateEntry[]) => {
    for (let i = 0; i < dateEntries.length; i++) {
        const entry = dateEntries[i];
        console.log(`Generating OG image ${entry.ogImageUrl} (${i + 1}/${dateEntries.length})`);
        await generateDateSocialImage(entry);
    }
}