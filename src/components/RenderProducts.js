import React, { useState, useEffect } from 'react';
import { NativeModules } from 'react-native';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    View,
    Item,
    Icon,
    Input,
    List,
    Text,
    Picker,
    Radio,
    Button,
} from 'native-base';
import { getProductsSelector, getMaxPrice } from 'selectors';
import Format from 'helpers/format';
import Slider from '@react-native-community/slider';
import Objects from 'constants/objects';
import RenderProductItem from './RenderProductItem';

const propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
        getParam: PropTypes.func,
        push: PropTypes.func,
        pop: PropTypes.func,
    }).isRequired,
    id: PropTypes.number.isRequired,
};

const RenderProducts = ({ id, navigation }) => {
    const { StoreToastModule } = NativeModules;
    const products = useSelector(getProductsSelector);
    const maxPrice = useSelector(getMaxPrice);
    const [searchText, setSearchText] = useState('');
    const [sortType, setSortType] = useState(0);
    const [showAll, setShowAll] = useState(true);
    const [showAvailable, setShowAvailable] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);
    const onSlidingComplete = (value) => setSliderValue(value);
    const getFilterProducts = products.filter((item) => {
        if (setSearchText) {
            return item.sublevel_id === id && item.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        }
        return item.sublevel_id === id;
    });
    const [currentCategoryProducts, setCurrentCategoryProducts] = useState([]);
    const onChangeText = (txt) => setSearchText(txt);
    const onChangeSortBy = (value) => setSortType(value);
    const onPressRadio = (radio) => () => {
        if (radio) {
            setShowAll(false);
            setShowAvailable(true);
        } else {
            setShowAll(true);
            setShowAvailable(false);
        }
    };
    useEffect(() => {
        let currentData = [...currentCategoryProducts];
        if (showAll === true && showAvailable === false) {
            currentData = [...getFilterProducts];
            StoreToastModule.showToast('Showing all products');
        } else if (showAll === false && showAvailable === true) {
            currentData = currentData.filter((item) => item.available);
            StoreToastModule.showToast('Showing just available products');
        }
        setCurrentCategoryProducts(currentData);
    }, [showAll, showAvailable]);
    useEffect(() => {
        const filteredtData = [...getFilterProducts].filter((item) => item.price <= sliderValue);
        setCurrentCategoryProducts(filteredtData);
        StoreToastModule.showToast(`Showing products under ${Format.currencyFormat(sliderValue)}`);
    }, [sliderValue]);
    useEffect(() => {
        setSliderValue(maxPrice);
    }, [maxPrice]);
    useEffect(() => {
        setCurrentCategoryProducts(getFilterProducts);
        StoreToastModule.showToast(`Showing products with the name '${searchText}'`);
    }, [searchText, setCurrentCategoryProducts]);
    useEffect(() => {
        const currentData = [...getFilterProducts];
        const { firstCondition, secondCondition } = Objects.conditionalSortOptions[sortType];
        currentData.sort((a, b) => {
            if (a.quantity > b.quantity) {
                return firstCondition;
            }
            return secondCondition;
        });
        setCurrentCategoryProducts(currentData);
    }, [sortType, setCurrentCategoryProducts]);
    return (
        <View>
            <View>
                <Item>
                    <Icon name="ios-search" />
                    <Input
                        onChangeText={onChangeText}
                        maxLengt={30}
                        value={searchText}
                        placeholder="Search"
                    />
                </Item>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ justifyContent: 'center' }}>
                    <Text>Sort by: </Text>
                </View>
                <View>
                    <Picker
                        mode="dropdown"
                        iosHeader="Sort by"
                        selectedValue={sortType}
                        onValueChange={onChangeSortBy}
                        iosIcon={<Icon name="arrow-dropdown-circle" style={{ color: 'blue', fontSize: 25 }} />}
                        style={{ width: 300 }}
                    >
                        <Picker.Item label="Quantity - Highest to lower" value={0} />
                        <Picker.Item label="Quantity - Lower to highest" value={1} />
                    </Picker>
                </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 1, textAlign: 'right' }}>0</Text>
                <Slider
                    style={{ flex: 3 }}
                    minimumValue={0}
                    maximumValue={maxPrice}
                    minimumTrackTintColor="#0000FF"
                    maximumTrackTintColor="#000000"
                    value={sliderValue}
                    step={1000}
                    onSlidingComplete={onSlidingComplete}
                />
                <Text style={{ flex: 1 }}>{Format.currencyFormat(maxPrice)}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ flex: 1, textAlign: 'center' }}>{Format.currencyFormat(sliderValue)}</Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <Button
                        transparent
                        onPress={onPressRadio(0)}
                    >
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text>Show all</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Radio onPress={onPressRadio(0)} selected={showAll} />
                            </View>
                        </View>
                    </Button>
                </View>
                <View style={{ flex: 1 }}>
                    <Button
                        transparent
                        onPress={onPressRadio(1)}
                    >
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text>Only available</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Radio onPress={onPressRadio(1)} selected={showAvailable} />
                            </View>
                        </View>
                    </Button>
                </View>
            </View>
            <List>
                {
                    currentCategoryProducts && currentCategoryProducts.map((item) => <RenderProductItem key={item.id} item={item} navigation={navigation} />)
                }
            </List>
        </View>
    );
};

RenderProducts.propTypes = propTypes;

export default RenderProducts;
