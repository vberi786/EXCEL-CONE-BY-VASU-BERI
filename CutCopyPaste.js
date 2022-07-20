let ctrlKey;
document.addEventListener("keydown", (e) =>{
    ctrlKey = e.ctrlKey;
    // console.log(ctrlKey);
})
document.addEventListener("keyup", (e) =>{
    ctrlKey = e.ctrlKey;
    // console.log(ctrlKey);
})

for (let i =0;i < rows;i++) {
    for (let j = 0;j < cols;j++) {
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        handleSelectedCells(cell);
    }
}

let copyBtn = document.querySelector(".copy");
let cutBtn = document.querySelector(".cut");
let pasteBtn = document.querySelector(".paste");

let rangeStorage = [];
function handleSelectedCells(cell){
    cell.addEventListener("click", (e)=>{

        if(!ctrlKey) return;

        if(rangeStorage.length >= 2){
            defaultSelectedCellsUI();
            rangeStorage = [];
        }

        cell.style.border = "3px solid #218c74";
        let rid = Number(cell.getAttribute("rid"));
        let cid = Number(cell.getAttribute("cid"));
        rangeStorage.push([rid,cid]);

    })
}



let copyData = [];
copyBtn.addEventListener("click", (e) => {
    if (rangeStorage.length < 2) return;
    copyData = [];

    let [strow, stcol, endrow, endcol] = [ rangeStorage[0][0], rangeStorage[0][1], rangeStorage[1][0], rangeStorage[1][1] ];

    for (let i = strow;i <= endrow;i++) {
        let copyRow = [];
        for (let j = stcol;j <= endcol;j++) {
            let cellProp = sheetDB[i][j];
            copyRow.push(cellProp);
        }
        copyData.push(copyRow);
    }
    // rangeStorage = [];
    // console.log("range storage "+ rangeStorage);
    // console.log("range storage top right"+ rangeStorage[0]);
    // console.log("range storage bottom left"+ rangeStorage[1]);
    // console.log("copy data : "+copyData);
    defaultSelectedCellsUI();
})

cutBtn.addEventListener("click", (e) => {
    if (rangeStorage.length < 2) return;
    copyData = [];
    console.log("cut btn")

    let [strow, stcol, endrow, endcol] = [ rangeStorage[0][0], rangeStorage[0][1], rangeStorage[1][0], rangeStorage[1][1] ];

    for (let i = strow;i <= endrow;i++) {
        let copyRow = [];
        console.log("I loop")
        for (let j = stcol;j <= endcol;j++) {
            console.log("J loop")
            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            // DB
            let cellProp = sheetDB[i][j];
            let tempCellProp = {...cellProp};
            copyRow.push(tempCellProp); // copying the value before removing

            cellProp.value = "";
            cellProp.bold = false;
            cellProp.italic = false;
            cellProp.underline = false;
            cellProp.fontSize = 14;
            cellProp.fontFamily = "monospace";
            cellProp.fontColor = "#000000";
            cellProp.BGcolor = "#000000";
            cellProp.alignment = "left";

            // UI
            cell.click();
        }
        copyData.push(copyRow);
    }
    // rangeStorage = [];
    // console.log("range storage "+ rangeStorage);
    // console.log("range storage top right"+ rangeStorage[0]);
    // console.log("range storage bottom left"+ rangeStorage[1]);
    defaultSelectedCellsUI();
})

pasteBtn.addEventListener("click" ,(e) => {
    // Past cells data work
    console.log("Copy data : "+copyData);
    if (rangeStorage.length < 2) return;

    let rowDiff = Math.abs(rangeStorage[0][0] - rangeStorage[1][0]);
    let colDiff = Math.abs(rangeStorage[0][1] - rangeStorage[1][1]);

    // Target
    let address = addressBar.value;
    let [stRow, stCol] = decodeRIDCIDFromAddress(address);


    // r -> refers copydata row
    // c -> refers copydata col
    for (let i = stRow,r = 0;i <= stRow+rowDiff;i++,r++) {
        for (let j = stCol,c = 0;j <= stCol+colDiff;j++,c++) {
            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            // console.log(cell);
            if (!cell) continue;

            // DB
            let data = copyData[r][c];
            let cellProp = sheetDB[i][j];

            cellProp.value = data.value;
            cellProp.bold = data.bold;
            cellProp.italic = data.italic;
            cellProp.underline = data.underline;
            cellProp.fontSize = data.fontSize;
            cellProp.fontFamily = data.fontFamily;
            cellProp.fontColor = data.fontColor;
            cellProp.BGcolor = data.BGcolor;
            cellProp.alignment = data.alignment;

            // UI
            cell.click();
        }
    }
    defaultSelectedCellsUI();
    // rangeStorage = [];
})

function defaultSelectedCellsUI() {
    for (let i = 0;i < rangeStorage.length;i++) {
        let cell = document.querySelector(`.cell[rid="${rangeStorage[i][0]}"][cid="${rangeStorage[i][1]}"]`);
        cell.style.border = "1px solid lightgrey";
    }
}