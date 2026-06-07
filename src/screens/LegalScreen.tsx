import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';

export const LegalScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const dynamicStyles = styles(theme);

    const openUrl = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const donors = [
        "epistularum", "昭玄大统", "Maciej Jur", "Ian Strandberg", "Kip", 
        "Lanwara", "Sky", "Adam", "Emanuel", "Moe sensei", "Abood", 
        "Wunkus", "Vincent", "kaZ", "Orly", "vash"
    ];

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={dynamicStyles.backBtn}>
                    <Text style={dynamicStyles.backText}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={dynamicStyles.title}>Legal & Credits</Text>
            </View>

            <ScrollView contentContainerStyle={dynamicStyles.content}>
                <Text style={dynamicStyles.mainDisclaimer}>
                    This app uses dictionary data from Jitendex.
                </Text>

                <View style={dynamicStyles.card}>
                    <Text style={dynamicStyles.mainTitle}>Jitendex</Text>
                    <Text style={dynamicStyles.author}>by Stephen Kraus</Text>
                    
                    <TouchableOpacity onPress={() => openUrl('https://jitendex.org')}>
                        <Text style={dynamicStyles.link}>https://jitendex.org</Text>
                    </TouchableOpacity>

                    <Text style={dynamicStyles.description}>
                        If Jitendex is useful for you, please consider giving the project a star on GitHub 
                        or leaving a tip on Ko-fi.
                    </Text>

                    <TouchableOpacity style={dynamicStyles.kofiBtn} onPress={() => openUrl('https://ko-fi.com/jitendex')}>
                        <Text style={dynamicStyles.kofiText}>☕ Support on Ko-fi</Text>
                    </TouchableOpacity>
                </View>

                <View style={dynamicStyles.section}>
                    <Text style={dynamicStyles.sectionTitle}>Attribution & License</Text>
                    <Text style={dynamicStyles.attributionText}>© CC BY-SA 4.0 Stephen Kraus 2023-2026</Text>
                    <Text style={dynamicStyles.sectionContent}>
                        You are free to use, modify, and redistribute Jitendex files under the terms of the 
                        Creative Commons Attribution-ShareAlike License (V4.0).
                    </Text>
                    <TouchableOpacity onPress={() => openUrl('https://creativecommons.org/licenses/by-sa/4.0/')}>
                        <Text style={dynamicStyles.smallLink}>View License Deed</Text>
                    </TouchableOpacity>
                    
                    <View style={dynamicStyles.modificationNotice}>
                        <Text style={dynamicStyles.modificationText}>
                            ⚠️ <Text style={{fontWeight: 'bold'}}>Notice of Modification:</Text> The original Jitendex data has been converted to a custom SQL format for use in Shiba Reader.
                        </Text>
                    </View>
                </View>

                <View style={dynamicStyles.section}>
                    <Text style={dynamicStyles.sectionTitle}>Copyrighted Sources</Text>
                    <Text style={dynamicStyles.sectionContent}>
                        Jitendex includes material from several copyrighted sources in compliance with the terms 
                        and conditions of those projects:
                    </Text>
                    <View style={dynamicStyles.bulletItem}>
                        <Text style={dynamicStyles.bullet}>•</Text>
                        <Text style={dynamicStyles.bulletText}>
                            <Text style={{fontWeight: 'bold'}}>JMdict:</Text> Electronic Dictionaries Research Group.
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => openUrl('https://www.edrdg.org/edrdg/licence.html')}>
                        <Text style={dynamicStyles.smallLink}>JMdict License</Text>
                    </TouchableOpacity>

                    <View style={dynamicStyles.bulletItem}>
                        <Text style={dynamicStyles.bullet}>•</Text>
                        <Text style={dynamicStyles.bulletText}>
                            <Text style={{fontWeight: 'bold'}}>Tatoeba:</Text> Example sentences licensed under CC BY 2.0 FR.
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => openUrl('https://creativecommons.org/licenses/by/2.0/fr/')}>
                        <Text style={dynamicStyles.smallLink}>Tatoeba License</Text>
                    </TouchableOpacity>

                    <View style={dynamicStyles.bulletItem}>
                        <Text style={dynamicStyles.bullet}>•</Text>
                        <Text style={dynamicStyles.bulletText}>
                            <Text style={{fontWeight: 'bold'}}>JmdictFurigana:</Text> Positional information for headword furigana. Distributed under a Creative Commons Attribution-ShareAlike License.
                        </Text>
                    </View>
                </View>

                <View style={dynamicStyles.section}>
                    <Text style={dynamicStyles.sectionTitle}>Special Thanks to Funders</Text>
                    <View style={dynamicStyles.donorGrid}>
                        {donors.map((donor, index) => (
                            <Text key={index} style={dynamicStyles.donorName}>• {donor}</Text>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface
    },
    backBtn: { marginRight: 15 },
    backText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
    title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.header },
    content: { padding: 20 },
    mainDisclaimer: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.header,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center'
    },
    mainTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
    author: { fontSize: 14, color: theme.colors.text, marginTop: 5 },
    link: { color: theme.colors.accent, marginTop: 10, fontSize: 14, textDecorationLine: 'underline' },
    description: { fontSize: 14, color: theme.colors.text, textAlign: 'center', marginTop: 15, lineHeight: 20 },
    kofiBtn: {
        marginTop: 20,
        backgroundColor: '#FF5E5B',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25
    },
    kofiText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    attributionText: { fontSize: 15, fontWeight: 'bold', color: theme.colors.header, marginBottom: 8 },
    sectionContent: { fontSize: 14, color: theme.colors.text, lineHeight: 22 },
    bulletItem: { flexDirection: 'row', marginTop: 10, paddingLeft: 5 },
    bullet: { fontSize: 14, color: theme.colors.primary, marginRight: 10 },
    bulletText: { flex: 1, fontSize: 14, color: theme.colors.text, lineHeight: 20 },
    donorName: { width: '50%', fontSize: 13, color: theme.colors.textMuted, marginBottom: 5 },
    smallLink: {
        color: theme.colors.primary,
        fontSize: 12,
        textDecorationLine: 'underline',
        marginTop: 5,
        marginBottom: 10
    },
    softwareList: {
        fontSize: 13,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
        marginTop: 5
    },
    modificationNotice: {
        backgroundColor: theme.colors.warning + '15',
        padding: 12,
        borderRadius: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: theme.colors.warning + '30'
    },
    modificationText: {
        fontSize: 12,
        color: theme.colors.text,
        lineHeight: 18
    }
});
