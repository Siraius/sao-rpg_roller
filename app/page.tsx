import { Button } from "@/components/ui/button";


export default function Home() {
 return (
   <main className="grid grid-rows-[auto_1fr_auto] min-h-screen">
     <header className="bg-blue-500 text-white p-4">Header</header>
     <div className="grid grid-cols-[200px_1fr_1fr]">
       <div className="bg-gray-100 p-4">
         <div className="flex flex-col gap-4 p-4">
           <h1 className="text-2xl font-bold">Sao Dice Roller</h1>
           <p className="text-gray-600">
             This is a dice roller for the Sao game.
           </p>
         </div>
         <div>
           <Button>Add Task</Button>
         </div>
       </div>
      
       <div className="bg-gray-200 p-4">
         <p>Hello</p>
       </div>
       <div className="bg-gray-400 p-4">
         <p>Hello</p>
       </div>
     </div>
     <footer className="bg-blue-500 text-white text-center p-4">Footer</footer>
   </main>
 );
}
