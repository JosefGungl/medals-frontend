import axios from "axios";
import { useState, useRef, useEffect } from "react";
import Country from "./components/Country";
import {
  Theme,
  Button,
  Flex,
  Heading,
  Badge,
  Container,
  Grid,
} from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import "@radix-ui/themes/styles.css";
import "./App.css";
import NewCountry from "./components/NewCountry";

function App() {

  const apiEndpoint = "https://medals-api-c0c0f9cscjfpbyff.canadacentral-01.azurewebsites.net/Api/country"

  const [appearance, setAppearance] = useState("dark");
  const [countries, setCountries] = useState([]);
  const medals = useRef([
    { id: 1, name: "gold", color: "#FFD700" },
    { id: 2, name: "silver", color: "#C0C0C0" },
    { id: 3, name: "bronze", color: "#CD7F32" },
  ]);

  function toggleAppearance() {
    setAppearance(appearance === "light" ? "dark" : "light");
  }

  const handleAdd = async (name) => {
    try {
      const { data: post } = await axios.post(apiEndpoint, {
        name: name,
        gold: 0,
        silver: 0,
        bronze: 0,
      })
      setCountries(
        countries.concat({
          id: post.id,
          name: name,
          gold: 0,
          silver: 0,
          bronze: 0,
        })
      );
    } catch (error) {
      console.error("Error adding country:", error);
      alert(`Failed to add country: ${error.response?.data?.message || error.message}`);
    }
  }

  const handleDelete = async (id) => {
    const originalCountries = countries;
    setCountries(countries.filter((c) => c.id !== id));

    try {
      await axios.delete(`${apiEndpoint}/${id}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.error("The record does not exist: ", err);
      } else {
        console.error("Error deleting country: ", err);
        setCountries(originalCountries);
      }
    }
    
  }

  function handleIncrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName] += 1;
    setCountries(mutableCountries);
  }

  function handleDecrement(countryId, medalName) {
    const idx = countries.findIndex((c) => c.id === countryId);
    const mutableCountries = [...countries];
    mutableCountries[idx][medalName] -= 1;
    setCountries(mutableCountries);
  }
  
  function getAllMedalsTotal() {
    let sum = 0;
    medals.current.forEach((medal) => {
      sum += countries.reduce((a, b) => a + b[medal.name], 0);
    });
    return sum;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: fetchedCountries } = await axios.get(apiEndpoint);
        setCountries(fetchedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        alert(`Failed to load countries: ${error.response?.data?.message || error.message}`);
      }
    }
    fetchData();
  }, [])

  return (
    <Theme appearance={appearance}>
      <Button
        onClick={toggleAppearance}
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}
        variant="ghost"
      >
        {appearance === "dark" ? <MoonIcon /> : <SunIcon />}
      </Button>
      <Flex p="2" pl="8" className="fixedHeader" justify="between">
        <Heading size="6">
          Olympic Medals
          <Badge variant="outline" ml="2">
            <Heading size="6">{getAllMedalsTotal()}</Heading>
          </Badge>
        </Heading>
        <NewCountry onAdd={handleAdd} />
      </Flex>
      <Container className="bg"></Container>
      <Grid pt="2" gap="2" className="grid-container">
        {countries
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((country) => (
            <Country
              key={country.id}
              country={country}
              medals={medals.current}
              onDelete={handleDelete}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
      </Grid>
    </Theme>
  );
}

export default App;
