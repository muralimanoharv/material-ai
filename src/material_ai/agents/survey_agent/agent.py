from google.adk.agents import Agent
from google.adk.tools.agent_tool import AgentTool
from material_ai.adk.agents import MaiAgent


def survey_ui_structure():
    return {
        "questions": """
        Hi What is your fathers name,
        Hi What is your mother name,
        Hi What is your age,
        Hi What is your favourite sport,
        """,
        "generated_output": """
        import React, { useState, useContext } from 'react';
        import { 
            Grid, 
            Box, 
            Card, 
            CardContent, 
            Typography, 
            TextField, 
            Button, 
            Divider,
            Fade,
            Paper
        } from '@mui/material';
        import { 
            Send, 
            Person, 
            FamilyRestroom, 
            Cake, 
            SportsSoccer, 
            CheckCircle 
        } from '@mui/icons-material';
        import { useForm, Controller } from 'react-hook-form';
        import { AppContext, useAgentId, useSessionId } from 'app';

        // Form Data Interface
        interface SurveyInputs {
            name: string;
            fatherName: string;
            motherName: string;
            age: string;
            favoriteSport: string;
        }

        const SimpleSurveyForm = () => {
            const appContext = useContext(AppContext);
            const agentId = useAgentId();
            const sessionId = useSessionId();

            const [isSubmitted, setIsSubmitted] = useState(false);

            const { control, handleSubmit, formState: { errors }, reset } = useForm<SurveyInputs>({
                defaultValues: {
                    name: '',
                    fatherName: '',
                    motherName: '',
                    age: '',
                    favoriteSport: ''
                }
            });

            const onSubmit = (data: SurveyInputs) => {
                console.log('Survey Data:', data);
                setIsSubmitted(true);
                
                // Interactive action: Inform the agent about the completion
                const summaryMessage = `I have completed the survey. My name is ${data.name}, I am ${data.age} years old, and my favorite sport is ${data.favoriteSport}. What should we do next?`;
                appContext.chatService.send_message(summaryMessage, { agent: agentId, session_id: sessionId });
            };

            if (isSubmitted) {
                return (
                    <Box sx={{ flexGrow: 1, p: 3 }}>
                        <Grid container spacing={3} justifyContent="center">
                            <Grid size={{ xs: 12,}}>
                                <Fade in={true}>
                                    <Card sx={{ textAlign: 'center', p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
                                        <Typography variant="h4" gutterBottom fontWeight="bold">
                                            Thank You!
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                            Your survey responses have been successfully recorded.
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                reset();
                                            }}
                                        >
                                            Fill Another Response
                                        </Button>
                                    </Card>
                                </Fade>
                            </Grid>
                        </Grid>
                    </Box>
                );
            }

            return (
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Grid container spacing={3} justifyContent="center">
                        <Grid size={{ xs: 12}}>  
                            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, boxShadow: 3 }}>
                                <Box sx={{ p: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                    <Typography variant="h4" fontWeight="bold">Survey Form</Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                        Please provide your details in the fields below.
                                    </Typography>
                                </Box>
                                
                                <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                                    <Box 
                                        component="form" 
                                        onSubmit={handleSubmit(onSubmit)}
                                        sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'minmax(0, 1fr)', 
                                            width: '100%',
                                            gap: 5
                                        }}
                                    >
                                        {/* Question 1 */}
                                        <Box>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                                                <Person color="primary" /> 1. Hi, What is your name?
                                            </Typography>
                                            <Controller
                                                name="name"
                                                control={control}
                                                rules={{ required: "Name is required" }}
                                                render={({ field }) => (
                                                    <TextField 
                                                        {...field} 
                                                        fullWidth 
                                                        placeholder="Enter your response here" 
                                                        variant="standard"
                                                        error={!!errors.name}
                                                        helperText={errors.name?.message}
                                                        sx={{ mt: 1 }}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {/* Question 2 */}
                                        <Box>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                                                <FamilyRestroom color="primary" /> 2. Hi, What is your father's name?
                                            </Typography>
                                            <Controller
                                                name="fatherName"
                                                control={control}
                                                rules={{ required: "Father's name is required" }}
                                                render={({ field }) => (
                                                    <TextField 
                                                        {...field} 
                                                        fullWidth 
                                                        placeholder="Enter your response here" 
                                                        variant="standard"
                                                        error={!!errors.fatherName}
                                                        helperText={errors.fatherName?.message}
                                                        sx={{ mt: 1 }}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {/* Question 3 */}
                                        <Box>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                                                <FamilyRestroom color="primary" /> 3. Hi, What is your mother's name?
                                            </Typography>
                                            <Controller
                                                name="motherName"
                                                control={control}
                                                rules={{ required: "Mother's name is required" }}
                                                render={({ field }) => (
                                                    <TextField 
                                                        {...field} 
                                                        fullWidth 
                                                        placeholder="Enter your response here" 
                                                        variant="standard"
                                                        error={!!errors.motherName}
                                                        helperText={errors.motherName?.message}
                                                        sx={{ mt: 1 }}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {/* Question 4 */}
                                        <Box>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                                                <Cake color="primary" /> 4. Hi, What is your age?
                                            </Typography>
                                            <Controller
                                                name="age"
                                                control={control}
                                                rules={{ 
                                                    required: "Age is required",
                                                    pattern: { value: /^[0-9]+$/, message: "Please enter a valid number" }
                                                }}
                                                render={({ field }) => (
                                                    <TextField 
                                                        {...field} 
                                                        type="number"
                                                        fullWidth 
                                                        placeholder="Enter your response here" 
                                                        variant="standard"
                                                        error={!!errors.age}
                                                        helperText={errors.age?.message}
                                                        sx={{ mt: 1 }}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {/* Question 5 */}
                                        <Box>
                                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 600 }}>
                                                <SportsSoccer color="primary" /> 5. Hi, What is your favourite sport?
                                            </Typography>
                                            <Controller
                                                name="favoriteSport"
                                                control={control}
                                                rules={{ required: "Favorite sport is required" }}
                                                render={({ field }) => (
                                                    <TextField 
                                                        {...field} 
                                                        fullWidth 
                                                        placeholder="Enter your response here" 
                                                        variant="standard"
                                                        error={!!errors.favoriteSport}
                                                        helperText={errors.favoriteSport?.message}
                                                        sx={{ mt: 1 }}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        <Box sx={{ pt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                type="submit" 
                                                variant="contained" 
                                                size="large" 
                                                endIcon={<Send />}
                                                sx={{ 
                                                    px: 6, 
                                                    py: 1.5, 
                                                    borderRadius: 2,
                                                    fontWeight: 'bold',
                                                    boxShadow: 2
                                                }}
                                            >
                                                Submit Survey
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            );
        };

        export default SimpleSurveyForm;
        """,
    }


survey_from_agent = MaiAgent(
    name="survey_from_agent",
    model="gemini-3-flash-preview",
    tools=[survey_ui_structure],
    instructions=r"""
        You are survey ui agent you will receive a list of survey questions in string and you need to 
        convert them to user interface code.
        I want you to always call 'survey_ui_structure' tool to understand the code structure to develop the UI.
        generate code similar to response from 'survey_ui_structure' tool
        We want full width for the card always provide xs: 12 for full width makes sure you occupy full width in ui for survey forms
        Only use Grid sizing as per the example provided from tool
    """,
)

generate_survey_form = AgentTool(agent=survey_from_agent)

root_agent = Agent(
    name="survey_agent",
    model="gemini-3-flash-preview",
    description="Survey Form Agent",
    instruction="""
    You are agent who takes a list of survey questions and convert them to a form.
    Initial Prompt: Great user & keep asking users for a list of survey questions.
    Once user provides a list of survey questions i want you to call 'generate_survey_form' tool
    just return the response directly from 'generate_survey_form' tool
    """,
    tools=[generate_survey_form],
)
