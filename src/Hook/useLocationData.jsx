import { useMemo } from 'react';
import districtData from '../assets/Json/District.json';

const useLocationData = (selectedDivision) => {
  // Extract unique divisions alphabetically
  const divisions = useMemo(() => {
    const allDivisions = districtData.map((item) => item.division);
    return [...new Set(allDivisions)].sort();
  }, []);

  // Filter districts based on the selected division
  const availableDistricts = useMemo(() => {
    if (!selectedDivision) return [];
    return districtData
      .filter((item) => item.division === selectedDivision)
      .map((item) => item.district)
      .sort();
  }, [selectedDivision]);

  return { divisions, availableDistricts };
};

export default useLocationData;