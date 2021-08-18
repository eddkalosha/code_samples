const twoNearestSubways = (x=0, y=0, stations=[]) =>{
  if (stations.length<3) return stations;

  const calcDistance = ({x:x2,y:y2}) => Math.sqrt(Math.pow((x - x2),2) + Math.pow((y - y2),2)); 

  let [current, next] = stations.splice(0,2);

  for (let i=0;i<stations.length-1; i++){
       if (calcDistance(current)>calcDistance(stations[i])) {
          next = current;
          current = stations[i]
        }else{
          if (calcDistance(next)>calcDistance(stations[i+1])){
              next = stations[i+1]
          }
        }  
  }

  return [current,next];
}

/*let stations =  [
        {x: 20, y: 20, name: 'Stamford Brook'}, 
        {x: 103, y: 243, name: 'Covent Garden'}, 
        {x: 143, y: 343, name: 'Piccadilly Circus'},
        {x: 200, y: 200, name: 'Seven Sisters'},
        {x: 1, y: 300, name: 'Stratford'},
        {x: 10, y: 10, name: 'Vauxhall'}];

twoNearestSubways(10,10,stations); */
