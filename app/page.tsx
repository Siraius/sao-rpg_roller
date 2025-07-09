import { Button } from "@/components/ui/button";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import  RollButton from "@/components/ui/diceroll"

export default function Home() {

 return (
  <div className="flex flex-col min-h-screen justify-center">
    <header className="sticky top-0 left-0 w-full bg-blue-500 text-white text-center p-4">Header</header>
    <main className="flex-1 bg-gray-800">
        <div className="bg-gray-300 gap-4 p-4 flex justify-center rounded my-4 mx-auto w-2/5">
            <h1 className="text-2xl font-bold">SAO-RPG.com Dice Roller</h1>
        </div>
        
        <div className="flex bg-gray-400 flex-col justify-center p-4 rounded mx-auto w-2/5">
            <h2 className="font-bold text-xl text-center">Information Fields</h2>
            <div className="flex flex-row justify-center">
              <div className="bg-gray-400">

                <div className="flex flex-col justify-center w-64 p-4 gap-2">
                  <p>Character Name:</p>
                  <input type="text" placeholder="Character Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                  <p>Link to Post:</p>
                  <input type="text" placeholder="Link to Post" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                  <p>Purpose of Roll:</p>
                  <input type="text" placeholder="Purpose" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                </div>
                <div className="p-4">
                  <RollButton />
                </div>
              </div>
              <div className="bg-gray-400 p-4 w-64 flex p-4 flex-col justify-center">
                <p>Search Fields</p>
                <div className="flex flex-col gap-2">
                  <input type="text" placeholder="Roll ID" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                  <input type="text" placeholder="Character Name" className="border rounded p-2 bg-gray-100 placeholder-black-400" />
                </div>
                <div className="p-4">
                  <Button>Search</Button>
                </div>
            </div>
          </div>
        </div>
    </main>
    <footer className="fixed bottom-0 left-0 w-full bg-blue-500 text-white text-center p-4">Footer</footer>
  </div>
 );
}
