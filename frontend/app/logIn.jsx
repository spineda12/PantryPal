import { API_URL, GOOGLE_LOGIN_ENABLED } from "../constants/api";
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LogIn = () => {
    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        'Montaga': require('../assets/fonts/Montaga-Regular.ttf'),
    });

    const [errorMessage, setErrorMessage] = useState('');
    const isWeb = Platform.OS === 'web';

    const handleSignUp = () => {
        router.push('/SignUp');
    };

    if (!fontsLoaded) {
        return null;
    }

    const handleSignIn = async () => {
        if (!username || !password) {
            setErrorMessage('Please enter your username and password.');
            return;
        }
        setErrorMessage('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            if (response.ok) {
                // The backend sends back the user's id as plain text, e.g. "7"
                const userId = (await response.text()).trim();
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('username', username);
                router.replace('/(tabs)');
            } else {
                setErrorMessage('Wrong username or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage("Can't reach the server. Is the backend running?");
        }
    }
        

    return (
        <View style={styles.mainContainer}>
            <Text style={styles.mainTitle}>login</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="your username"
                    placeholderTextColor="#846E6E"
                    value={username}
                    onChangeText={setusername}
                    autoCapitalize="none"
                />
                <View style={styles.inputLine} />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="your password"
                    placeholderTextColor="#846E6E"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <View style={styles.inputLine} />
            </View>
            
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleSignIn}
            >
                <Text style={styles.loginButtonText}>login</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                    <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
            </View>

            {GOOGLE_LOGIN_ENABLED && isWeb && (
                <>
                    <Text style={styles.orText}>or log in with google</Text>
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => { window.location.href = `${API_URL}/oauth2/authorization/google`; }}
                    >
                        <Text style={styles.googleButtonText}>Google</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#524242',
    },
    mainTitle: {
        fontFamily: 'Montaga',
        fontSize: 32,
        color: 'white',
        textAlign: 'center',
        marginBottom: 40,
        marginTop: 40,
    },
    inputGroup: {
        width: '100%',
        maxWidth: 400,
        marginBottom: 25,
    },
    label: {
        fontFamily: 'Montaga',
        color: 'white',
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        fontFamily: 'Montaga',
        width: '100%',
        height: 40,
        color: 'white',
        fontSize: 16,
        padding: 8,
        paddingLeft: 0,
    },
    inputLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#846E6E',
        marginTop: 4,
    },
    loginButton: {
        width: '100%',
        maxWidth: 400,
        padding: 15,
        backgroundColor: '#231911',
        borderRadius: 50,
        marginVertical: 30,
    },
    loginButtonText: {
        fontFamily: 'Montaga',
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    signUpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    signUpText: {
        fontFamily: 'Montaga',
        color: 'white',
        fontSize: 14,
    },
    signUpLink: {
        fontFamily: 'Montaga',
        color: '#B19696',
        fontSize: 14,
        marginLeft: 5,
    },
    errorText: {
        fontFamily: 'Montaga',
        color: '#ff9b9b',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: -10,
    },
    orText: {
        fontFamily: 'Montaga',
        color: '#231911',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 20,
    },
    googleButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 50,
        width: '100%',
        maxWidth: 400,
        marginBottom: 40,
    },
    googleButtonText: {
        fontFamily: 'Montaga',
        color: '#846E6E',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LogIn;