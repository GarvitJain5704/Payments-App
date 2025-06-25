import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import axios from "axios";
export function Dashboard() {
    const [balance, setBalance] = useState(0);
     useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance",{
            headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
        })
            .then(response => {
                setBalance(response.data.balance)
            })
    }, [balance])
    return <div className="p-10 m-10">
        <Appbar/>
        <Balance value={balance}/>
        <Users/>
    </div>
}