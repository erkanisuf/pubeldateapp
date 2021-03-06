import React, { useState, useEffect } from "react";
import Axios from "axios";
import ChildmyMatch from "./ChildmyMatch";
const MyMatches = () => {
  const [mymatches, setMymatches] = useState([]);
  useEffect(() => {
    Axios({
      method: "GET",
      headers: { "Content-Type": "application/json" },

      withCredentials: true,
      url: "https://dateappeldate.herokuapp.com/matches/getmymatches",
    })
      .then((res) => {
        if (res.status === 200) setMymatches(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",

        display: "flex",
        flexDirection: window.innerWidth <= 768 ? "column" : "row",
        flexWrap: "flex-wrap",
        justifyContent: "flex-start",

        alignContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      {mymatches.map((el, index) => {
        return <ChildmyMatch key={index} matchID={el.profile_id} />;
      })}
    </div>
  );
};

export default MyMatches;
