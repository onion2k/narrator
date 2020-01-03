import ReactDOM from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import Sweetalert from 'sweetalert2';

class Tab extends React.Component {
    constructor(props) {
        super(props);
        this.optionToggle = this.optionToggle.bind(this);
        this.showDropdown = this.showDropdown.bind(this);
        this.hideDropdown = this.hideDropdown.bind(this);
        this.state = {
            dropdownVisible: false,
            primary: this.props.primaryId,
        };

        this.toast = Sweetalert.mixin({
            toast: true,
            position: 'top-end',
            background: '#565A5C',
            confirmButtonColor: '#ffffff',
            showConfirmButton: false,
            customClass: 'toast-modal',
            timer: 3000,
        });

        this.options = {};
    }

    showDropdown() {
        this.setState({dropdownVisible: true});
    }

    hideDropdown() {
        this.setState({dropdownVisible: false});
    }

    updateBranch(selectedItem) {
        fetch(this.props.updateUrl, {
            method: 'post',
            credentials: 'same-origin',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN'),
            }),
            body: JSON.stringify({
                option: selectedItem,
            }),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (data.success) {
                this.toast({
                    type: 'success',
                    title: 'My Primary Branch updated!',
                }).then(() => {
                    window.location.reload();
                });
            } else {
                this.toast({
                    type: 'error',
                    title: 'Oops, Something went wrong!',
                });
            }
        });
    }

    optionToggle(e) {
        const row = e.currentTarget;
        const selectedItem = row.dataset.optionId;
        this.hideDropdown();
        this.updateBranch(selectedItem);
    }

    renderIsHovering() {
        if (!this.state.dropdownVisible) {
            return null;
        }

        return (
            <div className="branch-selector-options-container">
                <div className="branch-selector-options">
                    {this.props.items.map(item => this.checkPrimary(item))}
                    <a className="option-row create-new-branch" href={this.props.createUrl}>
                        <p>Create new branch</p>
                    </a>
                </div>
            </div>
        );
    }

    // Checks to make sure the branch is not the primary branch, as the primary branch should not be shown in the list
    checkPrimary(item) {
        if (this.props.primaryId === item.id) {
            return null;
        } else {
            return (
                <a key={item.id} className="option-row" data-option-id={item.id} onClick={this.optionToggle}>
                    <p className="branch-name">{item.name}</p>
                    <p className="branch-option">Select</p>
                </a>
            );
        }
    }

    render() {
        return (
            <div className="branch-selector" onMouseEnter={this.showDropdown} onMouseLeave={this.hideDropdown}>
                <div className="branch-selector-main">
                    <div className="branch-selector-icon">
                        <img alt="icon" src={this.props.icon} />
                    </div>
                    <div className="branch-selector-label">
                        <p className="branch-selector-label-small">Today, you're at</p>
                        <div className="primary-branch-label">{this.props.primaryName}<p className="down-arrow">&gt;</p></div>
                    </div>
                </div>
                {this.renderIsHovering()}
            </div>
        );
    }
}

export default Tab;

Tab.propTypes = {
    icon: PropTypes.string.isRequired,
    primaryId: PropTypes.number,
    primaryName: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object),
    primary: PropTypes.string,
    updateUrl: PropTypes.string.isRequired,
}

Tab.defaultProps = {
    items: [],
    primaryId: 0,
}


const mountPoints = Array.from(document.querySelectorAll('.react-branch-selector'));

if (mountPoints && mountPoints.length > 0) {

    mountPoints.forEach((mountPoint) => {
        const { icon, primaryName, updateUrl, createUrl } = mountPoint.dataset;
        let { primaryId, items } = mountPoint.dataset;
        items = JSON.parse(items);
        primaryId = parseInt(primaryId);
        ReactDOM.render(<Tab icon={icon} primaryId={primaryId} primaryName={primaryName} items={items} updateUrl={updateUrl} createUrl={createUrl} />, mountPoint);
    });
}
