const WeatherHeader = async () => {
  const url = `https://api.weatherapi.com/v1/current.json?key=9bf4c7a969af43f4a3b144637252010&q=16.0678,108.2208&lang=vi`;

  const response = await fetch(url);
  const data = await response.json();

  const weather = {
    location: data.location.name,
    text: data.current.condition.text,
    temp: data.current.temp_c,
    icon: data.current.condition.icon,
    localtime: data.location.localtime,
    isDay: data.current.is_day,
  };
  return weather;
};

export default WeatherHeader;
