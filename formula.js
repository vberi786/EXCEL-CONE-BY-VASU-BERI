for(let i=0; i<rows; i++){
    for(let j=0; j<cols; j++){
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        cell.addEventListener("blur", (e)=>{
            let address = addressBar.value;
            // console.log(address);
            let [activeCell, cellProp] = getCellAndCellProp(address);
            let enteredData = activeCell.innerText;
            // console.log("enteredData "+ enteredData);
            // console.log("cellProp.value "+cellProp.value);
            console.log(enteredData === cellProp.value);
            // console.log("entered data"+typeof(enteredData));
            // console.log("cellprop.value"+typeof(cellProp.value));
            
            if(enteredData === cellProp.value) return; // return
            else{
                cellProp.value=enteredData;
                removeChildFromParent(cellProp.formula);
                cellProp.formula = "";
                // console.log(sheetDB);
                updateChildrenCells(address);
            }
            //othrtwise update P-C relations & modify childers value and update formula
            

        })
    }
}


// let formulaBar = document.querySelector(".formula-bar");
formulaBar.addEventListener("keydown", async (e)=>{
    let inputFormula = formulaBar.value;
    if(e.key ==="Enter" && formulaBar.value){

        //if change in formula, break old P-C relation, evaluate new formula, add new P-C relation
        let address = addressBar.value;
        let [cell, cellProp] = getCellAndCellProp(address);
        if (inputFormula !== cellProp.formula) removeChildFromParent(cellProp.formula);

        addChildToGraphComponent(inputFormula, address); // adding child to parent array in Graph Matrix

        let cycleResponse = isGraphCyclic();
        if(cycleResponse){
            // alert("your formula is cyclic");
            let response = confirm("Your formula is Cyclic. Do you want to trace your path ?");
            while(response === true){
             
                await isGraphCylicTracePath(graphComponentMatrix, cycleResponse);
                response = confirm("Your formula is Cyclic. Do you want to trace your path ?");
            }
            removeChildFromGraphComponent(inputFormula, address); // if graph is cyclic then rremove child from matrix
            return;
        }
        let evaluatedValue = evaluateFormula(inputFormula);
        
        
        //to update UI and CellProp in Db
        setCellUIAndCellProp(evaluatedValue, inputFormula, address);
        addChildToParent(inputFormula);
        // console.log(sheetDb);
        updateChildrenCells(address);
    }
})


function removeChildFromGraphComponent(formula, childAddress){
    let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");

    for(let i=0; i< encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >=65 && asciiValue <= 90){
            let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].pop(); 
        }
    }
}

function addChildToGraphComponent(formula, childAddress){
    let [crid, ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for(let i=0; i<encodedFormula.length; i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);

            //Prid and Pcid is parent address extrcated from formula bas
            // now we insert child address in parent properties
            graphComponentMatrix[prid][pcid].push([crid, ccid]);
        }
    }
}


function updateChildrenCells(parentAddress){
    let [parentCell, parentCellProp] = getCellAndCellProp(parentAddress);
    let children = parentCellProp.children;

    for(let i=0; i<children.length; i++){
        let childAddress = children[i];
        let [childCell, childCellProp] = getCellAndCellProp(childAddress);
        let childFormula = childCellProp.formula;
        let evaluatedValue = evaluateFormula(childFormula);
        setCellUIAndCellProp(evaluatedValue, childFormula, childAddress);
        updateChildrenCells(childAddress);
    }
}


function addChildToParent(formula){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i=0; i<encodedFormula.length; i++){
        let asciivalue = encodedFormula[i].charCodeAt(0);
        if(asciivalue >= 65 && asciivalue <= 90){
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            parentCellProp.children.push(childAddress);
        }
    }
}

function removeChildFromParent(formula) {
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for (let i = 0; i < encodedFormula.length; i++) {
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >= 65 && asciiValue <= 90) {
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            // let idx;
            // for(let i=0; i<parentCellProp.children.length; i++){
            //     if(parentCellProp.children[i] === childAddress){
            //         idx = i;
            //     }
            // }
            let idx = parentCellProp.children.indexOf(childAddress);
            parentCellProp.children.splice(idx, 1);
        }
    }

}

function evaluateFormula(formula){
    let encodedFormula = formula.split(" ");
    for(let i=0; i<encodedFormula.length; i++){

        let asciivalue = encodedFormula[i].charCodeAt(0);
        if(asciivalue >= 65 && asciivalue <= 90){
            let[cell, cellProp] = getCellAndCellProp(encodedFormula[i]);
            encodedFormula[i]=cellProp.value;
        }
    }
    let decodedFormula= encodedFormula.join(" ");
    console.log(decodedFormula);
    return eval(decodedFormula);
}

function setCellUIAndCellProp(evaluatedValue, formula, address){
    
    let [cell, cellProp] = getCellAndCellProp(address);
    cell.innerText= evaluatedValue; //UI update
    cellProp.value = evaluatedValue+""; //Db update
    cellProp.formula = formula;
}