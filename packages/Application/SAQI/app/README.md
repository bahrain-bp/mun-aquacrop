# react App

In this step we could desgin the Application using react components in functions for example
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
      <Link href="/about" style={styles.button}>
        Go to About screen
      </Link>
    </View>
  );
}

in this code we have started a <view> and inside it we add any thing that we want to display such as the <Text> and to navigate we need to import import { Link } from 'expo-router'; first then using <Link> we could add href to the other page

