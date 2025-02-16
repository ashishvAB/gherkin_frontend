import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";

const keywordColors = {
  Given: "#1976d2",
  When: "#2e7d32",
  Then: "#d32f2f",
  And: "#757575",
  But: "#9c27b0",
};

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px !important",
}));

const FeatureTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
}));

const GherkinViewer = ({ data }) => {
  return (
    <Box sx={{ maxWidth: "900px", margin: "0 auto", p: 2 }}>
      {data.features.map((feature, featureIndex) => (
        <Paper
          key={featureIndex}
          elevation={0}
          sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: "#fafafa" }}
        >
          <FeatureTitle variant="h5">{feature.name}</FeatureTitle>
          {feature.scenarios.map((scenario, scenarioIndex) => (
            <ScenarioAccordion key={scenarioIndex} scenario={scenario} />
          ))}
        </Paper>
      ))}
    </Box>
  );
};

// const ScenarioAccordion = ({ scenario }) => {
//   return (
//     <StyledAccordion>
//       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//         <Typography variant="subtitle1" fontWeight={500}>
//           {scenario.Name}
//         </Typography>
//       </AccordionSummary>
//       <AccordionDetails>
//         <Box sx={{ py: 1 }}>
//           <Typography variant="body2" fontWeight={500}>Precondition:</Typography>
//           <Typography variant="body2" mb={1}>{scenario.Precondition}</Typography>
//           <Typography variant="body2" fontWeight={500}>Test Data:</Typography>
//           <Typography variant="body2" mb={1}>
//             {typeof scenario.Test_Data === 'object' && scenario.Test_Data !== null ? (
//               <Box component="div" sx={{ pl: 2 }}>
//                 {Object.entries(scenario.Test_Data).map(([key, value]) => (
//                   <Typography key={key} variant="body2">
//                     {key}: {value}
//                   </Typography>
//                 ))}
//               </Box>
//             ) : (
//               scenario.Test_Data
//             )}
//           </Typography>
//           <Typography variant="body2" fontWeight={500}>Expected Results:</Typography>
//           <Typography variant="body2" mb={1}>{scenario["Expected_Results"]}</Typography>
//           <Typography variant="body2" fontWeight={500}>Priority:</Typography>
//           <Typography variant="body2" mb={2}>{scenario.Priority}</Typography>
//           <Divider sx={{ mb: 2 }} />
//           {Array.isArray(scenario.Test_Steps) && scenario.Test_Steps.map((step, stepIndex) => (
//             <StepItem key={stepIndex} step={step} />
//           ))}
//         </Box>
//       </AccordionDetails>
//     </StyledAccordion>
//   );
// };

const ScenarioAccordion = ({ scenario }) => {
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value;
  };

  return (
    <StyledAccordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight={500}>
          {scenario.Name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight={500}>Precondition:</Typography>
          <Typography variant="body2" mb={1}>{scenario.Precondition}</Typography>
          <Typography variant="body2" fontWeight={500}>Test Data:</Typography>
          <Typography variant="body2" mb={1}>
            {typeof scenario.Test_Data === 'object' && scenario.Test_Data !== null ? (
              <Box component="div" sx={{ pl: 2 }}>
                {Object.entries(scenario.Test_Data).map(([key, value]) => (
                  <Typography key={key} variant="body2">
                    {key}: {renderValue(value)}
                  </Typography>
                ))}
              </Box>
            ) : (
              renderValue(scenario.Test_Data)
            )}
          </Typography>
          <Typography variant="body2" fontWeight={500}>Expected Results:</Typography>
          <Typography variant="body2" mb={1}>{renderValue(scenario.Expected_Results)}</Typography>
          <Typography variant="body2" fontWeight={500}>Priority:</Typography>
          <Typography variant="body2" mb={2}>{scenario.Priority}</Typography>
          <Divider sx={{ mb: 2 }} />
          {Array.isArray(scenario.Test_Steps) && scenario.Test_Steps.map((step, stepIndex) => (
            <StepItem key={stepIndex} step={step} />
          ))}
        </Box>
      </AccordionDetails>
    </StyledAccordion>
  );
};
const StepItem = ({ step }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          color: keywordColors[step.keyword] || "#757575",
          fontWeight: 600,
          minWidth: 60,
          mr: 1,
        }}
      >
        {step.keyword}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {step.text}
      </Typography>
    </Box>
  );
};

export default GherkinViewer;
