import React, { useState, useCallback, useRef } from "react";
import produce from "immer";
import styled from "styled-components";
import "./App.css";

function App() {
  //***** STATES *****

  //Rows
  const [gridRows, setGridRows] = useState({grows: 25});
  //Columns
  const [gridCols, setGridCols] = useState({ columns: 25 });
  //Locations to check cells
  const [locations, setLocations] = useState([
    [0, 1],
    [0, -1],
    [1, 0],
    [1, 1],
    [1, -1],
    [-1, 0],
    [-1, 1],
    [-1, -1],
  ]);
  //Interval for TimeOut
  const [intervalChange, setIntervalChange] = useState({ interval: 1000 });
  //Generation Counter
  const [generation, setGeneration] = useState(0);
  //Clickability
  const [canClick, setCanClick] = useState(true);
  //State to monitor if starting or stopping simulation
  const [running, setRunning] = useState(false);
  //Color
  const [cellColor, setCellColor] = useState({color: "red"});
  //Cell size
  const [cellSize, setCellSize] = useState(20);

  //***** HANDLERS *****

  //handles user input for interval change
  const handleChange = (e) => {
    setIntervalChange({ ...intervalChange, [e.target.name]: e.target.value });
  };
  //handles user input for grid columns
  const handleCols = (e) => {
    setGridCols({ ...gridCols, [e.target.name]: e.target.value });
  };
  //handles user inputs for grid rows
  const handleRows = (e) => {
    setGridRows({ ...gridRows, [e.target.name]: e.target.value });
  };
  //handles user inputted cell color
  const handleColor = (e) => {
    setCellColor({ ...cellColor, [e.target.name]: e.target.value });
  };
  //handles user inputted cell size
  const handleSize = (e) => {
    setCellSize({ ...cellSize, [e.target.name]: e.target.value });
  };
  //handles form button submit
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  //***** FUNCTIONS *****/
  //logic to clear out grid
  const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < gridRows.grows; i++) {
      rows.push(Array.from(Array(gridCols.columns), () => 0));
    }
    return rows;
  };

  //logic to randomize grid
  const generateRandomGrid = () => {
    const rows = [];
    for (let i = 0; i < gridRows.grows; i++) {
      rows.push(
        Array.from(Array(gridCols.columns), () => (Math.random() > 0.5 ? 1 : 0))
      );
    }
    return rows;
  };

  //use a reference to our changing running value
  const runningRef = useRef(running);
  runningRef.current = running; //current value of ref is equal to whatever running is
  //recursive function to make sure that we are running
  const runSimulation = useCallback(() => {
    //if not running will quit
    if (!runningRef.current) {
      return;
    }
    //makes not clickable
    setCanClick(!canClick);
    //sets the generation numbers
    setGeneration((prevState) => (prevState += 1));
    //can mutate the gridCopy and will update the state of our grid
    setGrid((g) => {
      //g will be current value of our grid
      return produce(g, (gridCopy) => {
        //double for loop will check all our cells on grid
        for (let i = 0; i < gridRows.grows; i++) {
          for (let j = 0; j < gridCols.columns; j++) {
            //compute the number of neighbors that each cell has and determine what to do with it
            let neighbors = 0;
            // if(gridCopy[i][j+1] ===1){
            //   neighbors +=1;
            // }
            locations.forEach(([x, y]) => {
              //each one will have a new x and y
              const newI = i + x;
              const newJ = j + y;
              if (
                newI >= 0 &&
                newI < gridRows.grows &&
                newJ >= 0 &&
                newJ < gridCols.columns
              ) {
                //check bounds to make sure we don't go above or below what we can
                neighbors += g[newI][newJ]; //want to take in current grid value so if we have a live cell that's equal to 1 will add 1 to new neigbours
              }
            });
            //Conditions
            if (neighbors < 2 || neighbors > 3) {
              //fewer then two dies or greater than three dies
              gridCopy[i][j] = 0;
            }
            //we don't need to do anything  for any live cell with two or three live neighbours living on to the next generation
            //Condition for any dead cell with exactly three live neighbours becomes a live cell; as if by reproduction
            else if (g[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      }); //will return a new value for our grid
    });
    //simulate the update
    setTimeout(runSimulation, intervalChange.interval); //calling again every second
  }, [intervalChange, canClick, gridCols, gridRows, locations]); //will make sure only runs once
  //STATE FOR OUR GRID
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid(); //to clear our grid
  });
  
  return (
    <>
      <Header>Conway's Game of Life</Header>
      <MainDiv>
        <GameDiv>
          <h2>We are on Generation # {generation}</h2>
          <form onSubmit={handleSubmit}>
            <h3>Feel like editing the grid?</h3>
            <p>
              Please note: To have changes applied, if you have a game running,
              hit stop, submit your edits and then click start!
            </p>
            <label htmlFor="interval">Edit the Speed of the Game:</label>
            <input
              placeholder="Enter input"
              name="interval"
              value={intervalChange.interval}
              onChange={handleChange}
            ></input>
            <label htmlFor="rows">Edit the Rows of the Grid:</label>
            <input
              placeholder="Enter rows"
              name="grows"
              value={gridRows.grows}
              onChange={handleRows}
            ></input>
            <label htmlFor="columns">Edit the Columns of the Grid:</label>
            <input
              placeholder="Enter columns"
              name="columns"
              value={gridCols.columns}
              onChange={handleCols}
            ></input>
            <label htmlFor="color">Edit the Color of the Cells:</label>
            <input
              placeholder="Enter color"
              name="color"
              value={cellColor.color}
              onChange={handleColor}
            ></input>
            <button>Submit</button>
          </form>
          <div>
            <h3>Click on the grid and then click start to get started!</h3>
            <h4>
              Or if you want a spin on the fun wheel, click random and then
              click start!
            </h4>
            <h4>
              When you want to pause or stop click Stop and to start over click
              clear and start fresh!
            </h4>
            <button
              onClick={() => {
                setRunning(!running);
                if (!running) {
                  runningRef.current = true; //update so we don't have a race condition between running simulation and the state update happening
                  runSimulation();
                }
              }}
            >
              {running ? "Stop" : "Start"}
            </button>
            <button
              onClick={() => {
                setGrid(generateRandomGrid());
              }}
            >
              Random
            </button>
            <button
              onClick={() => {
                setGrid(generateEmptyGrid());
              }}
            >
              Clear
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols.columns}, 20px)`,
            }}
          >
            {grid.map((rows, i) =>
              rows.map((col, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => {
                    //set initial state of our grid
                    //pass produce our current grid and then we can alter gridCopy to anything we want
                    //immer will generate a new grid for us
                    const newGrid = produce(grid, (gridCopy) => {
                      gridCopy[i][j] = grid[i][j] ? 0 : 1; //toggle for the initial state
                    });
                    setGrid(newGrid);
                  }}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: grid[i][j] ? cellColor.color : undefined,
                    border: "solid 1px black",
                    pointerEvents: canClick ? "initial" : "none",
                  }}
                />
              ))
            )}
          </div>
        </GameDiv>
        <InfoDiv>
          <h1>About</h1>
          <p>
            Conways's Game of Life also known as Life (not to be confused with
            the board game Life) is a cellular automaton(which is a distinct
            model studied in automata theory) created by John Horton Conway, a
            British mathematician in 1970. Even though it is called a game,
            there are no players. This means that the evolution of the cells is
            determined by the initial state. You just create an initial state,
            and watch how the cells evolve. Here I have created a simulation
            that you can create your own initial state and watch it go or click
            the random button and watch what happens to the cells.
          </p>
          <p>
            A cool thing about this Game of Life is that it is Turing complete.
            This means that this game is able to solve itself due to the set of
            rules that are established for it to run. These are simple rules
            that will control how the game reacts and it is able to solve
            itself, or continuously run until it has completed and fulfilled all
            rules. The game will run for as long as needed to reach the
            completion of these steps! What are these rules you ask?{" "}
          </p>
          <h1>Ye Ol' Rules</h1>
          <p>
            Before partaking of the rules, you must know that the Game of Life
            is an infinite grid of square cells, which can either be in one of
            two states: <strong>live</strong> or <em>dead</em> (or less
            dramatically populated and unpopulated). Every cell interacts with
            eight nieghbours which are the cells that are horizontal, vertical
            or diagonal to that cell. Knowing this, we can proceed to look at
            each transition of the cell:
          </p>
          <ol>
            <li>
              Any live cell with fewer than two live neighbours dies, as if by
              underpopulation.
            </li>
            <li>
              Any live cell with two or three live neighbours lives on to the
              next generation.
            </li>
            <li>
              Any live cell with more than three live neighbours dies, as if by
              overpopulation.
            </li>
            <li>
              Any dead cell with exactly three live neighbours becomes a live
              cell, as if by reproduction.
            </li>
          </ol>
          <p>
            These four rules can take us off in drastically different results
            depending on the initial state of our game! This initial state or
            pattern is considered the seed of the game, so when you create a
            pattern or randomize, you are seeding the game and setting up the
            the start of that run time's generations! The first generation
            applies the above rules to every cell in the seed and births and
            deaths occur at the same time. Each generation is a pure function of
            the preceding generation, and the rules will keep applying
            repeatedly to create future generations!
          </p>
        </InfoDiv>
      </MainDiv>
    </>
  );
}

export default App;

//***** STYLED COMPONENTS *****/
const gridStyle = styled.div`
  display: "grid";
`;
const RowStyles = styled.div`
  width: 20px;
  height: 20px;
  border: "solid 1px black";
`;
const Header = styled.h1`
  text-align: center;
`;
const MainDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const GameDiv = styled.div`
  width: 50%;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  form {
    display: flex;
    flex-direction: column;

    input {
      width: 5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 0.5rem 0.5rem;
      margin: 0.5rem 0.8rem 0;
    }
  }

  button {
    width: 10rem;
  }
`;

const InfoDiv = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
