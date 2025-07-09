'use client'

import { DiceRoll } from "@dice-roller/rpg-dice-roller"
import { Button } from "./button"
import { useState } from "react"

export default function RollButton() {

    const rollBD = () => {
        const roll = new DiceRoll("1d10");
        console.log(roll.total)
        setBDRoll(roll.total);
    }

    const rollCD = () => {
        const roll = new DiceRoll("1d12");
        console.log(roll.total)
        setCDRoll(roll.total);
    }
    
    const rollLD = () => {
        const roll = new DiceRoll("1d20");
        console.log(roll.total)
        setLDRoll(roll.total);
    }

    const rollMD = () => {
        const roll = new DiceRoll("1d10");
        console.log(roll.total)
        setMDRoll(roll.total);
    }

    const rollAll = () => {
        rollBD();
        rollCD();
        rollLD();
        rollMD();
    }

    const [BDRoll, setBDRoll] = useState(0);
    const [CDRoll, setCDRoll] = useState(0);
    const [MDRoll, setMDRoll] = useState(0);
    const [LDRoll, setLDRoll] = useState(0);

    return (
        <div>
        <Button className="p-4" onClick={rollAll}>Roll</Button>
        <p className="mt-4">BD {BDRoll} | CD {CDRoll} | LD {LDRoll} | MD {MDRoll} </p>
        </div>
    )
}