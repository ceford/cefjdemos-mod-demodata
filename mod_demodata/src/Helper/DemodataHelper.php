<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  mod_demodata
 *
 * @copyright   (C) 2017 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Cefjdemos\Module\Demodata\Administrator\Helper;

use Joomla\CMS\Event\AbstractEvent;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Helper for mod_demodata
 *
 * @since  3.8.0
 */
class DemodataHelper
{
    /**
     * Get a list of demodata.
     *
     * @return  mixed  An array of demodata, or false on error.
     *
     * @since  5.1.0
     */
    public function getDemodataList()
    {
        PluginHelper::importPlugin('demodata');

        return Factory::getApplication()
            ->getDispatcher()
            ->dispatch(
                'onDemodataGetOverview',
                AbstractEvent::create(
                    'onDemodataGetOverview',
                    [
                        'subject' => new \stdClass(),
                    ]
                )
            )
            ->getArgument('result') ?? [];
    }

    /**
     * Get a list of demodata.
     *
     * @return  mixed  An array of demodata, or false on error.
     *
     * @since  3.8.0
     *
     * @deprecated 5.1.0 will be removed in 7.0
     *             Use the non-static method getDemodataList
     *             Example: Factory::getApplication()->bootModule('mod_demodata', 'administrator')
     *                            ->getHelper('DemodataHelper')
     *                            ->getDemodataList()
     */
    public static function getList()
    {
        return (new self())->getDemodataList();
    }
}
